# WLED JSON API Validation Suite

This directory contains tools and scripts for validating the OpenAPI schema against real WLED device implementations.

## Overview

The validation process involves:
1. **Data Collection**: Capture live JSON responses from WLED devices
2. **Data Sanitization**: Remove sensitive information for safe storage/sharing  
3. **Schema Validation**: Compare captured data against OpenAPI schemas
4. **Report Generation**: Document discrepancies and required schema updates

## Directory Structure

```
validation/
├── scripts/              # Data collection and processing tools
│   ├── collect-data.js   # Capture JSON API responses from WLED devices
│   └── sanitize-data.js  # Remove sensitive data from captured responses
├── captured-data/        # Raw device responses (GITIGNORED - sensitive!)
├── sanitized-data/       # Cleaned data safe for validation (GITIGNORED)
└── reports/             # Validation reports and analysis (GITIGNORED)
```

## Usage

### 1. Data Collection

Collect JSON API responses from a WLED device:

```bash
# Collect from default IP (10.0.0.100)
npm run validate:collect

# Collect from specific device
npm run validate:collect:esp32
# or
node validation/scripts/collect-data.js 192.168.1.100
```

**Endpoints captured:**
- `/json` - Complete API response
- `/json/state` - Current device state
- `/json/info` - Device information
- `/json/cfg` - Complete configuration
- `/json/eff` - Effects list
- `/json/pal` - Palettes list
- `/json/palx?page=0` & `/json/palx?page=1` - Paginated palettes
- `/json/fxda` - Effect metadata
- `/json/nodes` - Network nodes discovery
- `/json/net` - Network information
- `/json/si` - Combined state+info
- `/json/live` - Live data stream info

### 2. Data Sanitization

Remove sensitive information from captured data:

```bash
# Sanitize specific folder
npm run validate:sanitize esp32-ethernet

# Sanitize all captured data
npm run validate:sanitize:all
```

**Sensitive data removed:**
- SSIDs and network names → `WLED-Device`
- MAC addresses/BSSIDs → `AA:BB:CC:DD:EE:FF`
- IP addresses → `192.168.1.100`
- Device names → `WLED Device`
- Passwords/keys → `***`
- mDNS names → `wled-device`

### 3. Schema Validation

*Coming soon: Tools to compare sanitized data against OpenAPI schemas*

## Device Configurations Tested

### ESP32 with Ethernet
- **Version**: WLED v0.15.0 ESP32_Ethernet
- **Hardware**: ESP32 with Ethernet adapter
- **LEDs**: 30x WS2812B strip
- **Features**: AudioReactive usermod enabled
- **Data**: `captured-data/esp32-ethernet/`

## Security Notes

- ⚠️ **Never commit captured-data/**: Contains real device information
- ✅ **sanitized-data/ is committed**: Safe data with all sensitive info removed
- 🔒 **Pattern-based sanitization**: Automatically detects and replaces sensitive patterns
- 📊 **Validation ready**: Sanitized data maintains schema structure for validation

## Contributing Device Data

To contribute test data from your WLED device:

1. Run data collection: `npm run validate:collect`
2. Run sanitization: `npm run validate:sanitize your-device-name`
3. Share only the sanitized data for validation purposes
4. Document your device configuration in this README

---

*This validation suite ensures our OpenAPI schema accurately represents real WLED implementations across different hardware and software configurations.* 