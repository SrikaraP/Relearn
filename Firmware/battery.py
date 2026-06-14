"""
Desk Scanner — Battery / System Voltage Monitor
Reads ADS1115 (U5) over I2C1 (GPIO2/GPIO3).

ADS1115 channel assignments (from schematic):
  AIN0 (ch 0): BAT_SENSE — battery voltage via R19(100k)/R20(22k) divider
  AIN1 (ch 1): Not connected in this design
  AIN2 (ch 2): SYS5_SENSE — +5V_SYS via R21(47k)/R22(47k) divider
  AIN3 (ch 3): Not connected

ADS1115 address: 0x48 (ADDR → GND).
Reference voltage: VDD = 3.3 V (from +3V3_CM5).
PGA setting: ±4.096 V (so 1 LSB = 4.096 / 32768 V ≈ 125 µV).
"""

import time
import logging
import threading

from scanner.config import (
    I2C_BUS, ADS1115_ADDR, ADS1115_PGA,
    BAT_DIVIDER_RATIO, SYS5_DIVIDER_RATIO,
    BAT_FULL_V, BAT_NOM_V, BAT_LOW_V, BAT_CUTOFF_V,
)

log = logging.getLogger(__name__)

try:
    import smbus2
    _I2C_AVAILABLE = True
except ImportError:
    log.warning("smbus2 not available — battery monitor in stub mode")
    _I2C_AVAILABLE = False

# ADS1115 register addresses
_REG_CONV   = 0x00   # Conversion register
_REG_CONFIG = 0x01   # Config register

# Config register bits
_OS_SINGLE    = 0x8000  # Start single-shot conversion
_MUX_AIN0_GND = 0x4000  # AIN0 vs GND
_MUX_AIN1_GND = 0x5000  # AIN1 vs GND
_MUX_AIN2_GND = 0x6000  # AIN2 vs GND
_MUX_AIN3_GND = 0x7000  # AIN3 vs GND
_PGA_4096     = 0x0200  # ±4.096 V
_MODE_SINGLE  = 0x0100  # Single-shot
_DR_128       = 0x0080  # 128 SPS
_COMP_DISABLE = 0x0003  # Disable comparator

_BASE_CONFIG  = _PGA_4096 | _MODE_SINGLE | _DR_128 | _COMP_DISABLE

_MUX_MAP = {0: _MUX_AIN0_GND, 1: _MUX_AIN1_GND,
            2: _MUX_AIN2_GND, 3: _MUX_AIN3_GND}


class BatteryMonitor:
    """Reads battery and 5 V rail voltages from the ADS1115."""

    def __init__(self) -> None:
        self._bus = None
        self._lock = threading.Lock()
        self._battery_v = 0.0
        self._sys5_v = 0.0
        self._poll_thread: threading.Thread | None = None
        self._running = False

    # ── Lifecycle ─────────────────────────────────────────────────────────────
    def start(self, poll_interval_s: float = 10.0) -> None:
        if _I2C_AVAILABLE:
            try:
                self._bus = smbus2.SMBus(I2C_BUS)
                log.info("ADS1115 initialised on I2C-%d, addr=0x%02X",
                         I2C_BUS, ADS1115_ADDR)
            except OSError as e:
                log.error("Cannot open I2C bus %d: %s", I2C_BUS, e)
                self._bus = None
        else:
            log.info("Battery monitor in stub mode")

        self._running = True
        self._poll_thread = threading.Thread(
            target=self._poll_loop,
            args=(poll_interval_s,),
            daemon=True,
            name="battery-poll",
        )
        self._poll_thread.start()

    def stop(self) -> None:
        self._running = False
        if self._bus:
            try:
                self._bus.close()
            except Exception:
                pass

    # ── Low-level ADS1115 read ────────────────────────────────────────────────
    def _read_channel_v(self, channel: int) -> float:
        """Read single-ended voltage on AIN{channel} (vs GND)."""
        if not _I2C_AVAILABLE or self._bus is None:
            return 0.0

        mux = _MUX_MAP.get(channel, _MUX_AIN0_GND)
        config = _OS_SINGLE | mux | _BASE_CONFIG

        # Write config (big-endian to ADS1115)
        config_bytes = [(config >> 8) & 0xFF, config & 0xFF]
        try:
            self._bus.write_i2c_block_data(ADS1115_ADDR, _REG_CONFIG, config_bytes)
            # Wait for conversion (1/128 SPS ≈ 8 ms, use 12 ms to be safe)
            time.sleep(0.012)
            # Read 2-byte conversion result
            data = self._bus.read_i2c_block_data(ADS1115_ADDR, _REG_CONV, 2)
            raw = (data[0] << 8) | data[1]
            if raw >= 0x8000:
                raw -= 0x10000   # two's complement for negative values
            volts = raw * ADS1115_PGA / 32768.0
            return max(0.0, volts)
        except OSError as e:
            log.debug("ADS1115 read error: %s", e)
            return 0.0

    # ── Polling loop ──────────────────────────────────────────────────────────
    def _poll_loop(self, interval_s: float) -> None:
        while self._running:
            with self._lock:
                adc_bat = self._read_channel_v(0)   # BAT_SENSE
                adc_sys = self._read_channel_v(2)   # SYS5_SENSE
                self._battery_v = adc_bat / BAT_DIVIDER_RATIO  if adc_bat > 0.05 else 0.0
                self._sys5_v    = adc_sys / SYS5_DIVIDER_RATIO if adc_sys > 0.05 else 0.0
            log.debug("Battery=%.2f V  5V_SYS=%.2f V", self._battery_v, self._sys5_v)
            time.sleep(interval_s)

    # ── Public accessors ──────────────────────────────────────────────────────
    def battery_voltage(self) -> float:
        with self._lock:
            return self._battery_v

    def sys5_voltage(self) -> float:
        with self._lock:
            return self._sys5_v

    def battery_percent(self) -> int:
        """Approximate state-of-charge as 0–100 %."""
        v = self.battery_voltage()
        if v <= 0:
            return -1   # unknown
        if v >= BAT_FULL_V:
            return 100
        if v <= BAT_CUTOFF_V:
            return 0
        # Linear interpolation across the usable range
        usable_range = BAT_FULL_V - BAT_CUTOFF_V
        return int(round((v - BAT_CUTOFF_V) / usable_range * 100))

    def battery_status(self) -> str:
        """Return 'ok', 'low', 'critical', 'charging', or 'unknown'."""
        v = self.battery_voltage()
        if v <= 0:
            return "unknown"
        if v >= BAT_FULL_V:
            return "full"
        if v >= BAT_LOW_V:
            return "ok"
        if v >= BAT_CUTOFF_V:
            return "low"
        return "critical"

    def status_dict(self) -> dict:
        return {
            "battery_v":       round(self.battery_voltage(), 2),
            "sys5_v":          round(self.sys5_voltage(), 2),
            "battery_percent": self.battery_percent(),
            "battery_status":  self.battery_status(),
        }
