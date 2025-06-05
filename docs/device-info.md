# WLED Device Information API

The `/json/info` endpoint provides comprehensive information about a WLED device, including its version, hardware capabilities, and current status.

## Version Compatibility

The device information endpoint has evolved across WLED versions:

- **WLED 0.14.0+**
  - Added `ip` field showing device's current IP address
  - Deprecated `lwip` field (to be removed in future versions)
  - Enhanced LED capabilities reporting with `seglc` array

- **WLED 0.13.0**
  - Added `cct` field for color temperature support
  - Added node discovery count `ndc`
  - Added filesystem information `fs`

- **WLED 0.12.0**
  - Added network discovery information
  - Enhanced WiFi reporting with signal quality

- **WLED 0.11.0**
  - Added filesystem information
  - Enhanced LED segment support

## Hardware Configurations

Different WLED hardware setups will report different capabilities:

### Basic LED Strip
```json
{
  "ver": "0.14.0",
  "vid": 2310130,
  "leds": {
    "count": 30,
    "pwr": 900,
    "fps": 60,
    "maxpwr": 1500,
    "maxseg": 12,
    "seglc": [1],
    "lc": 1
  }
}
```

### Matrix Display
```json
{
  "leds": {
    "count": 256,
    "pwr": 7680,
    "fps": 40,
    "maxpwr": 8000,
    "maxseg": 12,
    "seglc": [1],
    "lc": 1,
    "matrix": {
      "w": 16,
      "h": 16
    }
  }
}
```

### RGBW Strip
```json
{
  "leds": {
    "count": 60,
    "pwr": 3600,
    "fps": 50,
    "maxpwr": 4000,
    "maxseg": 12,
    "seglc": [3],
    "lc": 3
  }
}
```

## Resource Requirements

The device information endpoint reports system resource usage that can help diagnose issues:

- `freeheap`: Available RAM (problematic if < 10KB)
- `psram`: Additional memory if supported by hardware
- `fs.u`: Used filesystem space
- `fs.t`: Total filesystem space

## Network Capabilities

Network information helps diagnose connectivity:

- WiFi signal strength and quality
- Current IP address and MAC
- UDP port for realtime control
- WebSocket client count
- Node discovery status

## Build Features

The `opt` field contains a bitmap of build features:
```
0x80: Debug enabled
0x40: Alexa disabled
0x20: (Deprecated) Blynk support
0x10: Chronixie usermod
0x08: Filesystem disabled
0x04: Hue sync disabled
0x02: AdaLight enabled
0x01: OTA disabled
``` 