# Platform-Specific Fields in WLED

This document describes the fields that are specific to different WLED platforms (ESP32 vs ESP8266) and how they behave differently. The implementation can be found in `WLED/wled00/json.cpp` in the `serializeInfo()` function.

## ESP32-Specific Fields

These fields are only present when running on ESP32:

```cpp
#ifdef ARDUINO_ARCH_ESP32
  root[F("clock")] = ESP.getCpuFreqMHz();
  root[F("flash")] = (ESP.getFlashChipSize()/1024)/1024;
  if (psramFound()) root[F("psram")] = ESP.getFreePsram();
#endif
```

- `clock`: CPU frequency in MHz
  - Type: integer
  - Example: 240
  - Read-only
  - Not available on ESP8266
  - Source: `ESP.getCpuFreqMHz()`

- `flash`: Flash memory size in MB
  - Type: integer
  - Example: 4
  - Read-only
  - Not available on ESP8266
  - Source: `ESP.getFlashChipSize()`

- `psram`: Available PSRAM in bytes
  - Type: integer (uint64)
  - Only present when hardware supports PSRAM
  - Read-only
  - Not available on ESP8266
  - Source: `ESP.getFreePsram()`

## ESP8266-Specific Fields

These fields are only present when running on ESP8266:

```cpp
#else
  root[F("lwip")] = LWIP_VERSION_MAJOR;
#endif
```

- `lwip`: LWIP version
  - Type: integer
  - Example: 2
  - Read-only
  - Not available on ESP32
  - Source: `LWIP_VERSION_MAJOR`

## Platform-Dependent Fields

These fields behave differently depending on the platform:

```cpp
#ifdef ARDUINO_ARCH_ESP32
  #if !defined(CONFIG_IDF_TARGET_ESP32C2) && !defined(CONFIG_IDF_TARGET_ESP32C3) && !defined(CONFIG_IDF_TARGET_ESP32S2) && !defined(CONFIG_IDF_TARGET_ESP32S3)
    root[F("arch")] = "esp32";
  #else
    root[F("arch")] = ESP.getChipModel();
  #endif
  root[F("core")] = ESP.getSdkVersion();
#else
  root[F("arch")] = "esp8266";
  root[F("core")] = ESP.getCoreVersion();
#endif
```

- `arch`: Platform name
  - ESP32: "esp32" or specific chip model
  - ESP8266: "esp8266"
  - Read-only
  - Source: `ESP.getChipModel()` or hardcoded string

- `core`: SDK version
  - ESP32: Format "vX.X.X-XX-gxxxxxxxx" from `ESP.getSdkVersion()`
  - ESP8266: Different format from `ESP.getCoreVersion()`
  - Read-only

## Feature Availability Flags

The `opt` field contains build-time feature flags that may vary by platform:

```cpp
uint16_t os = 0;
#ifdef WLED_DEBUG
os  = 0x80;
  #ifdef WLED_DEBUG_HOST
  os |= 0x0100;
  if (!netDebugEnabled) os &= ~0x0080;
  #endif
#endif
#ifndef WLED_DISABLE_ALEXA
os += 0x40;
#endif
#ifdef USERMOD_CRONIXIE
os += 0x10;
#endif
#ifndef WLED_DISABLE_FILESYSTEM
os += 0x08;
#endif
#ifndef WLED_DISABLE_HUESYNC
os += 0x04;
#endif
#ifdef WLED_ENABLE_ADALIGHT
os += 0x02;
#endif
```

Bit | Value | Feature | ESP32 | ESP8266 | Source
----|-------|---------|-------|---------|--------
0x01 | 1 | Adalight | Yes | Yes | `WLED_ENABLE_ADALIGHT`
0x02 | 2 | Hue Sync | Yes | Yes | `WLED_DISABLE_HUESYNC`
0x04 | 4 | Filesystem | Yes | Yes | `WLED_DISABLE_FILESYSTEM`
0x08 | 8 | Cronixie | Yes | Yes | `USERMOD_CRONIXIE`
0x10 | 16 | Alexa | Yes | Yes | `WLED_DISABLE_ALEXA`
0x20 | 32 | Debug | Yes | Yes | `WLED_DEBUG`
0x40 | 64 | Debug Host | Yes | No | `WLED_DEBUG_HOST`
0x80 | 128 | Debug | Yes | Yes | `WLED_DEBUG`
0x100 | 256 | Debug UI | Yes | No | `WLED_DEBUG_HOST`

Note: Some features may be disabled at build time regardless of platform. The flags are set during compilation based on the build configuration. 