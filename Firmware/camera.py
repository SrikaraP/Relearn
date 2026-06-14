"""
Desk Scanner — Camera Controller
Wraps picamera2 for the Raspberry Pi Camera Module 3 Autofocus (IMX708).

MIPI0 (J3 22-pin FFC) is used for the camera.
Provides:
  - MJPEG preview stream for web UI
  - Triggered autofocus + high-res still capture
  - Optional basic image enhancement (CLAHE / sharpening)
"""

import io
import time
import logging
import threading
from pathlib import Path
from datetime import datetime

from scanner.config import (
    CAMERA_MAX_RES, CAMERA_PREVIEW_RES, CAMERA_JPEG_QUALITY,
    SCAN_DPI, PDF_TEMP_DIR, AF_SETTLE_TIME,
)

log = logging.getLogger(__name__)

try:
    from picamera2 import Picamera2
    from picamera2.encoders import JpegEncoder
    from picamera2.outputs import FileOutput
    from libcamera import controls as lc_controls
    _CAM_AVAILABLE = True
except ImportError:
    log.warning("picamera2 not available — camera running in stub mode")
    _CAM_AVAILABLE = False


class StreamOutput(io.BufferedIOBase):
    """Thread-safe frame buffer for MJPEG streaming."""

    def __init__(self) -> None:
        self.frame: bytes = b""
        self.condition = threading.Condition()

    def write(self, buf: bytes) -> int:
        if buf.startswith(b"\xff\xd8"):          # JPEG start-of-image marker
            with self.condition:
                self.frame = buf
                self.condition.notify_all()
        return len(buf)


class CameraController:
    """
    Controls Camera Module 3 AF for preview + scanning.
    Thread-safe: preview and capture share the same picamera2 instance.
    """

    def __init__(self) -> None:
        self._cam: "Picamera2 | None" = None
        self._stream_output = StreamOutput()
        self._encoder: "JpegEncoder | None" = None
        self._lock = threading.Lock()
        self._streaming = False
        Path(PDF_TEMP_DIR).mkdir(parents=True, exist_ok=True)

    # ── Lifecycle ─────────────────────────────────────────────────────────────
    def start(self) -> None:
        if not _CAM_AVAILABLE:
            log.info("Camera stub active")
            return
        log.info("Initialising Camera Module 3 AF …")
        self._cam = Picamera2()

        # Dual-stream config: main = full-res for stills, lores = preview
        config = self._cam.create_still_configuration(
            main={"size": CAMERA_MAX_RES, "format": "RGB888"},
            lores={"size": CAMERA_PREVIEW_RES, "format": "YUV420"},
            buffer_count=2,
            display="lores",
        )
        self._cam.configure(config)

        # Continuous autofocus on the preview stream
        self._cam.set_controls({
            "AfMode":        lc_controls.AfModeEnum.Continuous,
            "AfSpeed":       lc_controls.AfSpeedEnum.Fast,
            "AeExposureOffset": 0,
            "AwbMode":       lc_controls.AwbModeEnum.Auto,
            "Sharpness":     1.5,
            "Contrast":      1.1,
        })

        # Start streaming encoder for preview
        self._encoder = JpegEncoder(q=70)
        self._cam.start_recording(
            self._encoder,
            FileOutput(self._stream_output),
            name="lores",
        )
        self._streaming = True
        log.info("Camera ready — max_res=%s preview_res=%s",
                 CAMERA_MAX_RES, CAMERA_PREVIEW_RES)

    def stop(self) -> None:
        if self._cam and self._streaming:
            try:
                self._cam.stop_recording()
                self._cam.stop()
            except Exception as e:
                log.debug("Camera stop: %s", e)
            self._streaming = False
        log.info("Camera stopped")

    # ── Preview stream ────────────────────────────────────────────────────────
    def generate_mjpeg(self):
        """Generator that yields MJPEG frames for Flask's streaming response."""
        if not _CAM_AVAILABLE:
            # Return a static grey placeholder in dev mode
            import struct
            placeholder = self._placeholder_jpeg()
            while True:
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n"
                       + placeholder + b"\r\n")
                time.sleep(0.1)
            return

        output = self._stream_output
        while True:
            with output.condition:
                output.condition.wait(timeout=2.0)
                frame = output.frame
            if frame:
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n"
                       + frame + b"\r\n")

    # ── Still capture ─────────────────────────────────────────────────────────
    def capture_image(self) -> "str | None":
        """
        Trigger AF, capture a full-resolution still, and return the file path.
        Returns None on failure.
        """
        if not _CAM_AVAILABLE:
            # Return a stub image path
            return self._create_stub_image()

        with self._lock:
            log.info("Triggering autofocus …")
            try:
                # Switch to one-shot AF, trigger, wait for convergence
                job = self._cam.autofocus_cycle()
                success = self._cam.wait(job)
                if not success:
                    log.warning("AF did not converge — capturing anyway")
                time.sleep(0.1)   # brief settle

                # Capture full-res still
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                out_path = str(Path(PDF_TEMP_DIR) / f"scan_{timestamp}.jpg")

                request = self._cam.capture_request()
                try:
                    img_array = request.make_array("main")
                    metadata = request.get_metadata()
                finally:
                    request.release()

                # Save as JPEG with EXIF DPI
                from PIL import Image
                pil_img = Image.fromarray(img_array)
                pil_img = self._enhance(pil_img)
                pil_img.save(
                    out_path,
                    format="JPEG",
                    quality=CAMERA_JPEG_QUALITY,
                    dpi=(SCAN_DPI, SCAN_DPI),
                    optimize=True,
                )
                log.info("Captured → %s (focus_distance=%.2f m)",
                         out_path,
                         metadata.get("LensPosition", 0))
                return out_path

            except Exception as e:
                log.error("Capture failed: %s", e)
                return None

    # ── Image enhancement ─────────────────────────────────────────────────────
    @staticmethod
    def _enhance(pil_img: "Image.Image") -> "Image.Image":
        """
        Mild CLAHE-style contrast enhancement and sharpening.
        Keeps colour fidelity for document scanning.
        """
        try:
            import cv2
            import numpy as np

            img_np = np.array(pil_img)
            lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
            l_ch, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l_ch = clahe.apply(l_ch)
            merged = cv2.merge([l_ch, a, b])
            result = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)
            return Image.fromarray(result)
        except ImportError:
            # OpenCV not available — apply mild PIL sharpening
            from PIL import ImageFilter, ImageEnhance
            img = ImageEnhance.Contrast(pil_img).enhance(1.2)
            img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=80, threshold=3))
            return img

    # ── Dev-mode helpers ──────────────────────────────────────────────────────
    @staticmethod
    def _placeholder_jpeg() -> bytes:
        try:
            from PIL import Image, ImageDraw
            img = Image.new("RGB", (640, 480), color=(40, 40, 40))
            draw = ImageDraw.Draw(img)
            draw.text((200, 220), "No camera — stub mode", fill=(200, 200, 200))
            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            return buf.getvalue()
        except Exception:
            return b""

    @staticmethod
    def _create_stub_image() -> str:
        try:
            from PIL import Image, ImageDraw
            img = Image.new("RGB", (800, 600), color=(245, 245, 245))
            draw = ImageDraw.Draw(img)
            draw.rectangle([50, 50, 750, 550], outline=(0, 0, 0), width=3)
            draw.text((300, 280), "Stub scan page", fill=(100, 100, 100))
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            out = str(Path(PDF_TEMP_DIR) / f"stub_{timestamp}.jpg")
            img.save(out, format="JPEG", quality=95, dpi=(SCAN_DPI, SCAN_DPI))
            return out
        except Exception:
            return ""
