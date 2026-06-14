"""
Desk Scanner — GPIO Controller
Handles: SW1 scan button, SW2 lighting button, LED PWM (AL8860MP), buzzer (Q1).

Hardware-PWM for LED dimming is written via /sys/class/pwm/pwmchip0/pwm0
(enabled by dtoverlay=pwm,pin=18,func=2 in /boot/firmware/config.txt).
Buttons are read via RPi.GPIO with falling-edge interrupt.
Buzzer is driven by brief on/off pulses on GPIO13 through the Q1 MOSFET.
"""

import threading
import time
import os
import logging
from pathlib import Path
from scanner.config import (
    GPIO_BTN_SCAN, GPIO_BTN_LIGHTING, GPIO_BUZZER, GPIO_LED_PWM,
    LED_PWM_FREQUENCY, LED_BRIGHTNESS_LEVELS, LED_DEFAULT_LEVEL,
    BEEP_SCAN_START, BEEP_SCAN_DONE, BEEP_PDF_READY, BEEP_ERROR,
)

log = logging.getLogger(__name__)

try:
    import RPi.GPIO as GPIO
    _GPIO_AVAILABLE = True
except ImportError:
    log.warning("RPi.GPIO not available — GPIO control disabled (dev mode)")
    _GPIO_AVAILABLE = False


# ─── PWM LED control via sysfs ───────────────────────────────────────────────
_PWM_BASE = Path("/sys/class/pwm/pwmchip0")
_PWM_CHANNEL = _PWM_BASE / "pwm0"


def _pwm_write(filename: str, value: str) -> None:
    try:
        (_PWM_CHANNEL / filename).write_text(value)
    except OSError as e:
        log.debug("PWM sysfs write %s=%s: %s", filename, value, e)


def _pwm_init() -> bool:
    """Export PWM channel 0 and configure it.  Returns True on success."""
    if not _PWM_BASE.exists():
        log.warning("PWM chip not found — did you add dtoverlay=pwm,pin=18,func=2 ?")
        return False
    if not _PWM_CHANNEL.exists():
        try:
            (_PWM_BASE / "export").write_text("0")
            time.sleep(0.1)
        except OSError as e:
            log.error("Cannot export PWM0: %s", e)
            return False
    period_ns = str(int(1e9 / LED_PWM_FREQUENCY))
    _pwm_write("period", period_ns)
    _pwm_write("duty_cycle", "0")
    _pwm_write("enable", "1")
    log.info("Hardware PWM initialised on GPIO18 at %d Hz", LED_PWM_FREQUENCY)
    return True


def _pwm_set_duty(percent: float) -> None:
    """Set duty cycle 0–100 %."""
    period_ns = int(1e9 / LED_PWM_FREQUENCY)
    duty_ns = int(period_ns * max(0.0, min(100.0, percent)) / 100.0)
    _pwm_write("duty_cycle", str(duty_ns))


# ─── GPIO Controller class ───────────────────────────────────────────────────
class GPIOController:
    """
    Manages all PCB GPIO: scan button, lighting button, LED brightness,
    and buzzer.  Callbacks are invoked from a background thread.
    """

    def __init__(self) -> None:
        self._brightness_idx = LED_BRIGHTNESS_LEVELS.index(LED_DEFAULT_LEVEL)
        self._pwm_ok = False
        self._buzzer_lock = threading.Lock()

        # Callback hooks — set by the caller
        self.on_scan_button: callable = None
        self.on_lighting_button: callable = None

    # ── Initialisation ────────────────────────────────────────────────────────
    def setup(self) -> None:
        self._pwm_ok = _pwm_init()
        if not _GPIO_AVAILABLE:
            log.info("GPIO running in simulation mode")
            return

        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        # Buttons — active LOW, hardware debounce C8/C9 on PCB
        GPIO.setup(GPIO_BTN_SCAN,     GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(GPIO_BTN_LIGHTING, GPIO.IN, pull_up_down=GPIO.PUD_UP)

        # Buzzer — via Q1 MOSFET, driven HIGH to sound
        GPIO.setup(GPIO_BUZZER, GPIO.OUT, initial=GPIO.LOW)

        # Edge detection with 50 ms software debounce (extra insurance)
        GPIO.add_event_detect(GPIO_BTN_SCAN,     GPIO.FALLING,
                              callback=self._scan_cb,     bouncetime=50)
        GPIO.add_event_detect(GPIO_BTN_LIGHTING, GPIO.FALLING,
                              callback=self._lighting_cb, bouncetime=50)

        # Set initial LED brightness
        self.set_brightness(LED_DEFAULT_LEVEL)
        log.info("GPIO controller ready — scan=GPIO%d lighting=GPIO%d led_pwm=GPIO%d buzzer=GPIO%d",
                 GPIO_BTN_SCAN, GPIO_BTN_LIGHTING, GPIO_LED_PWM, GPIO_BUZZER)

    def cleanup(self) -> None:
        if self._pwm_ok:
            _pwm_write("enable", "0")
        if _GPIO_AVAILABLE:
            GPIO.cleanup()
        log.info("GPIO cleaned up")

    # ── Button callbacks ──────────────────────────────────────────────────────
    def _scan_cb(self, channel: int) -> None:
        log.debug("Scan button pressed (GPIO%d)", channel)
        if callable(self.on_scan_button):
            threading.Thread(target=self.on_scan_button, daemon=True).start()

    def _lighting_cb(self, channel: int) -> None:
        log.debug("Lighting button pressed (GPIO%d)", channel)
        self._brightness_idx = (self._brightness_idx + 1) % len(LED_BRIGHTNESS_LEVELS)
        level = LED_BRIGHTNESS_LEVELS[self._brightness_idx]
        self.set_brightness(level)
        if callable(self.on_lighting_button):
            threading.Thread(target=self.on_lighting_button, args=(level,),
                             daemon=True).start()

    # ── LED brightness ────────────────────────────────────────────────────────
    def set_brightness(self, percent: float) -> None:
        """Set LED brightness 0–100 %.  Also updates the brightness cycle index."""
        if percent in LED_BRIGHTNESS_LEVELS:
            self._brightness_idx = LED_BRIGHTNESS_LEVELS.index(int(percent))
        if self._pwm_ok:
            _pwm_set_duty(percent)
        log.debug("LED brightness → %d %%", percent)

    def get_brightness(self) -> int:
        return LED_BRIGHTNESS_LEVELS[self._brightness_idx]

    def leds_off(self) -> None:
        if self._pwm_ok:
            _pwm_set_duty(0)

    def leds_on(self) -> None:
        self.set_brightness(LED_BRIGHTNESS_LEVELS[self._brightness_idx])

    # ── Buzzer ────────────────────────────────────────────────────────────────
    def _buzz_pattern(self, pattern: list[tuple[int, int]]) -> None:
        if not _GPIO_AVAILABLE:
            return
        with self._buzzer_lock:
            for on_ms, off_ms in pattern:
                GPIO.output(GPIO_BUZZER, GPIO.HIGH)
                time.sleep(on_ms / 1000.0)
                GPIO.output(GPIO_BUZZER, GPIO.LOW)
                if off_ms:
                    time.sleep(off_ms / 1000.0)

    def beep(self, pattern_name: str = "scan_done") -> None:
        patterns = {
            "scan_start": BEEP_SCAN_START,
            "scan_done":  BEEP_SCAN_DONE,
            "pdf_ready":  BEEP_PDF_READY,
            "error":      BEEP_ERROR,
        }
        pattern = patterns.get(pattern_name, BEEP_SCAN_DONE)
        threading.Thread(target=self._buzz_pattern, args=(pattern,), daemon=True).start()
