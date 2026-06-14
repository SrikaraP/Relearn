"""
Desk Scanner Firmware — Configuration
All settings derived from schematic analysis of Desk_Scanner.kicad_sch.

GPIO pin numbers are BCM (Broadcom) numbers for the CM5.
Confirmed from schematic net-label to CM5 pin-position mapping.
"""

# ─── GPIO PINS (BCM numbering) ──────────────────────────────────────────────
# Confirmed from schematic net labels at their exact y-positions on CM5 symbol
# (origin at x=69.85, y=105.41; abs_y = origin_y - sym_y)

GPIO_I2C_SDA      = 2   # I2C1_SDA → ADS1115 (pin #58 on CM5 connector)
GPIO_I2C_SCL      = 3   # I2C1_SCL → ADS1115 (pin #56)
GPIO_ADC_ALERT    = 4   # ADC_ALERT from ADS1115 ALERT/RDY (pin #54)
GPIO_BUZZER       = 13  # BUZZER_GPIO → Q1 MOSFET gate (pin #28)
GPIO_UART_TXD     = 14  # UART debug TX (pin #55) — handled by OS
GPIO_UART_RXD     = 15  # UART debug RX (pin #51) — handled by OS
GPIO_BTN_SCAN     = 17  # BTN_SCAN → SW1 Scan/Capture button (pin #50), active LOW
GPIO_LED_PWM      = 18  # LED_PWM → AL8860MP DIM pins on U3 & U4 (pin #49), HW-PWM
GPIO_BTN_LIGHTING = 27  # BTN_LED_MODE → SW2 Lighting level button (pin #48), active LOW
# SW3 → nRPIBOOT (CM5 pin #93, dedicated recovery pin, not a BCM GPIO)
# SW4 → PWR_BUT  (CM5 pin #92, dedicated power button, not a BCM GPIO)

# ─── I2C / ADS1115 ──────────────────────────────────────────────────────────
I2C_BUS           = 1      # /dev/i2c-1 (GPIO2/GPIO3 = I2C1)
ADS1115_ADDR      = 0x48   # ADDR pin → GND (default address)
ADS1115_PGA       = 4.096  # Volts full-scale (PGA = ±4.096 V)

# Voltage divider ratios (from schematic)
# BAT_SENSE: R19 (100k top) / R20 (22k bottom)  →  22k / 122k = 0.18033
# SYS5_SENSE: R21 (47k top) / R22 (47k bottom)  →  47k / 94k  = 0.50000
BAT_DIVIDER_RATIO   = 22.0 / (100.0 + 22.0)  # = 0.18033
SYS5_DIVIDER_RATIO  = 47.0 / (47.0 + 47.0)   # = 0.50000

# 3S Li-ion thresholds (volts on battery pack)
BAT_FULL_V   = 12.6  # 4.20 V × 3 cells
BAT_NOM_V    = 11.1  # 3.70 V × 3 cells
BAT_LOW_V    = 9.9   # 3.30 V × 3 cells (warn)
BAT_CUTOFF_V = 9.0   # 3.00 V × 3 cells (critical)

# ─── LED LIGHTING ───────────────────────────────────────────────────────────
# AL8860MP DIM pin: 100 Hz – 50 kHz PWM, 0 % duty = off, 100 % = full brightness
LED_PWM_FREQUENCY = 1000   # 1 kHz — well within AL8860MP DIM range
LED_BRIGHTNESS_LEVELS = [25, 50, 75, 100]   # % — cycled by SW2
LED_DEFAULT_LEVEL  = 75    # percent on startup

# ─── CAMERA ─────────────────────────────────────────────────────────────────
# Raspberry Pi Camera Module 3 (IMX708, 12MP) on MIPI0 (J3 connector)
CAMERA_MAX_RES     = (4608, 2592)   # Full 12 MP
CAMERA_PREVIEW_RES = (1280, 720)    # Preview stream to web UI
CAMERA_JPEG_QUALITY = 95            # 0-100 for captured stills
SCAN_DPI           = 300            # DPI stored in JPEG EXIF + PDF metadata
AF_SETTLE_TIME     = 0.8            # seconds to allow autofocus to settle

# ─── PDF ────────────────────────────────────────────────────────────────────
PDF_OUTPUT_DIR     = "/var/scanner/pdfs"   # also served via Samba
PDF_TEMP_DIR       = "/var/scanner/tmp"
PDF_AUTHOR         = "Desk Scanner"
PDF_PRODUCER       = "Desk Scanner Firmware"

# ─── NETWORK ────────────────────────────────────────────────────────────────
AP_SSID            = "DeskScanner"
AP_PASSWORD        = "scanner123"    # WPA2 password; set "" for open network
AP_IP              = "10.42.0.1"
AP_DHCP_RANGE      = ("10.42.0.10", "10.42.0.100")
AP_CHANNEL         = 6
MDNS_HOSTNAME      = "scanner"      # reachable as scanner.local
WEB_PORT           = 80

SAMBA_SHARE_NAME   = "Scans"        # \\scanner.local\Scans
SAMBA_COMMENT      = "Desk Scanner PDFs"

# ─── BUZZER PATTERNS ─────────────────────────────────────────────────────────
# Each tuple: (on_ms, off_ms)  — sequence of beep/pause pairs
BEEP_SCAN_START    = [(80, 40), (80, 0)]     # double-blip when scan begins
BEEP_SCAN_DONE     = [(120, 0)]              # single tone when image captured
BEEP_PDF_READY     = [(100, 80), (100, 80), (200, 0)]  # triple rising tone
BEEP_ERROR         = [(500, 0)]              # long error buzz
