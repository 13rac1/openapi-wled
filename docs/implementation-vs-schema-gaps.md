# WLED JSON API: Implementation vs Schema Analysis

This document analyzes the differences between the current OpenAPI schema (which matches the Rust `wled-json-api-library`) and the actual WLED JSON API implementation found in `WLED/wled00/json.cpp`.

## Executive Summary

The current OpenAPI specification covers approximately **75-80% of the actual API surface area**. Key gaps identified:
- Missing API endpoints (4 major endpoints)
- Incomplete state object documentation (~20 missing fields)
- Configuration schema field name mismatches (~20% alignment issues)
- Incomplete device information schema (~15 missing fields)
- Missing segment and effect metadata

**Major Discovery**: Extensive configuration schemas already exist (35 files) but require field-by-field validation for proper alignment with the implementation.

## Missing API Endpoints

### 1. Combined State + Info Endpoint
**Implementation**: `/json/si`
**Status**: ❌ Missing from OpenAPI
**Function**: `json_target::state_info` in `serveJson()`

```cpp
// From json.cpp line 1103
else if (url.indexOf("si") > 0) subJson = json_target::state_info;

// Returns combined state and info objects
case json_target::state_info:
case json_target::all:
  JsonObject state = lDoc.createNestedObject("state");
  serializeState(state);
  JsonObject info = lDoc.createNestedObject("info");
  serializeInfo(info);
```

**Response Structure**:
```json
{
  "state": { /* full state object */ },
  "info": { /* full info object */ }
}
```

### 2. Effect Data Endpoint
**Implementation**: `/json/fxda`
**Status**: ❌ Missing from OpenAPI
**Function**: `json_target::fxdata` in `serveJson()`

```cpp
// From json.cpp line 1107
else if (url.indexOf(F("fxda")) > 0) subJson = json_target::fxdata;

// Calls serializeModeData() function
void serializeModeData(JsonArray fxdata) {
  // Returns array of effect metadata/configuration data
  char lineBuffer[256];
  for (size_t i = 0; i < strip.getModeCount(); i++) {
    strncpy_P(lineBuffer, strip.getModeData(i), sizeof(lineBuffer)/sizeof(char)-1);
    // Extracts data after '@' character
    char* dataPtr = strchr(lineBuffer,'@');
    if (dataPtr) fxdata.add(dataPtr+1);
    else         fxdata.add("");
  }
}
```

### 3. Paginated Palette Endpoint
**Implementation**: `/json/palx?page=N`
**Status**: ❌ Missing from OpenAPI
**Function**: `json_target::palettes` with pagination

```cpp
// From json.cpp line 1106
else if (url.indexOf(F("palx")) > 0) subJson = json_target::palettes;

// Supports pagination via page parameter
serializePalettes(lDoc, request->hasParam(F("page")) ? request->getParam(F("page"))->value().toInt() : 0);
```

**Response includes color data, not just names**:
```json
{
  "m": 5,  // max pages
  "p": {
    "0": [[0,255,160,0], [64,255,0,0], ...],  // palette 0 colors
    "1": ["r", "r", "r", "r"],                // random palette
    "2": ["c1"]                               // primary color only
  }
}
```

### 4. Base JSON Endpoint
**Implementation**: `/json`
**Status**: ❌ Missing from OpenAPI
**Function**: `json_target::all`

Returns complete API data including state, info, effects, and palette names.

## Missing State Object Fields

### Core State Fields

| Field | Type | Description | Implementation Location |
|-------|------|-------------|------------------------|
| `ledmap` | integer | Current LED map ID | `serializeState()` line 644 |
| `error` | integer | Error code if present | `serializeState()` line 640 |

```cpp
// From serializeState() in json.cpp
root["ps"] = (currentPreset > 0) ? currentPreset : -1;
root[F("pl")] = currentPlaylist;
root[F("ledmap")] = currentLedmap;  // ❌ Missing from schema

if (errorFlag) {
  root[F("error")] = errorFlag;     // ❌ Missing from schema
  errorFlag = ERR_NONE;
}
```

### Nightlight Object (`nl`) Missing Fields

| Field | Type | Description |
|-------|------|-------------|
| `rem` | integer | Remaining time in seconds (-1 if inactive) |

```cpp
// From serializeState() line 653
nl[F("rem")] = nightlightActive ? 
  (int)(nightlightDelayMs - (millis() - nightlightStartTime)) / 1000 : -1;
```

### UDP Sync Object (`udpn`) Missing Fields

| Field | Type | Description |
|-------|------|-------------|
| `sgrp` | integer | Sync groups (bitfield) |
| `rgrp` | integer | Receive groups (bitfield) |

```cpp
// From serializeState() lines 658-661
udpn[F("send")] = sendNotificationsRT;
udpn[F("recv")] = receiveGroups != 0;
udpn[F("sgrp")] = syncGroups;     // ❌ Missing from schema
udpn[F("rgrp")] = receiveGroups;  // ❌ Missing from schema
```

### Segment Object Missing Fields

| Field | Type | Description |
|-------|------|-------------|
| `lc` | integer | Light capabilities bitfield |
| `len` | integer | Segment length (calculated from stop-start) |

```cpp
// From serializeSegment() lines 589-590
root["len"] = seg.stop - seg.start;  // ❌ Missing from schema
root["lc"] = seg.getLightCapabilities();  // ❌ Missing from schema
```

## Missing Device Information Fields

### Version and Hardware Info

| Field | Type | Description | Implementation |
|-------|------|-------------|----------------|
| `cn` | string | Codename | `serializeInfo()` line 695 |
| `release` | string | Release information | `serializeInfo()` line 697 |
| `clock` | integer | CPU frequency in MHz | Platform specific |
| `flash` | integer | Flash memory size in MB | Platform specific |
| `ndc` | integer | Node discovery count | `serializeInfo()` line 882 |

```cpp
// From serializeInfo() in json.cpp
root[F("ver")] = versionString;
root[F("vid")] = VERSION;
root[F("cn")] = F(WLED_CODENAME);      // ❌ Missing from schema
root[F("release")] = releaseString;    // ❌ Missing from schema

// Platform-specific fields (ESP32 vs ESP8266)
#ifdef ARDUINO_ARCH_ESP32
  root[F("clock")] = ESP.getCpuFreqMHz();     // ❌ Missing
  root[F("flash")] = (ESP.getFlashChipSize()/1024)/1024;  // ❌ Missing
#endif

root[F("ndc")] = nodeListEnabled ? (int)Nodes.size() : -1;  // ❌ Missing
```

## Missing Configuration Schema

**UPDATE**: After examining the `openapi/components/schemas/config/` directory, there are actually **35 configuration schema files** already defined, providing much more coverage than initially assessed. However, there are **field name mismatches** and some missing fields between the schema and implementation.

### Configuration Schema Coverage Status
✅ **Well-covered areas**: Hardware, Network, Interfaces, Timers, OTA, DMX, NTP, MQTT, Hue, etc.
⚠️ **Field name mismatches**: Several properties have different names between schema and implementation
❌ **Missing fields**: Some implementation fields not documented in schemas

### Key Field Name Mismatches

#### Ethernet Configuration
**Implementation** (`cfg.cpp` line 887):
```cpp
JsonObject ethernet = root.createNestedObject("eth");
ethernet["type"] = ethernetType;  // Uses "type"
```

**Schema** (`EthernetConfig.yaml`):
```yaml
relay:  # ❌ Should be "type"
  type: integer
  enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
```

#### Other Potential Mismatches
The following areas need verification for field name consistency:
1. **Hardware LED configuration** - Complex pin and bus configurations
2. **Button macros** - Array structures for multiple buttons
3. **Interface settings** - Various protocol configurations
4. **Timer instances** - Complex scheduling objects

### Missing Configuration Fields (Sample)

#### 2D Matrix Configuration
```cpp
// From cfg.cpp - Matrix panel configuration
#ifndef WLED_DISABLE_2D
if (strip.isMatrix) {
  JsonObject matrix = hw_led.createNestedObject(F("matrix"));
  matrix[F("mpc")] = strip.panel.size();  // Panel count
  JsonArray panels = matrix.createNestedArray(F("panels"));
  for (size_t i = 0; i < strip.panel.size(); i++) {
    JsonObject pnl = panels.createNestedObject();
    pnl["b"] = strip.panel[i].bottomStart;    // ❓ Check if in schema
    pnl["r"] = strip.panel[i].rightStart;    // ❓ Check if in schema  
    pnl["v"] = strip.panel[i].vertical;      // ❓ Check if in schema
    pnl["s"] = strip.panel[i].serpentine;    // ❓ Check if in schema
    pnl["x"] = strip.panel[i].xOffset;       // ❓ Check if in schema
    pnl["y"] = strip.panel[i].yOffset;       // ❓ Check if in schema
    pnl["h"] = strip.panel[i].height;        // ❓ Check if in schema
    pnl["w"] = strip.panel[i].width;         // ❓ Check if in schema
  }
}
#endif
```

**Revised Assessment**: The configuration schema coverage is **much better than initially thought** (~80% vs 10%), but requires **field-by-field validation** to ensure proper alignment between implementation and documentation.

## Impact on API Coverage

### Current Coverage Analysis

| API Section | Implementation Completeness | Schema Coverage | Gap |
|-------------|----------------------------|-----------------|-----|
| **Endpoints** | 10 endpoints | 6 documented | 40% missing |
| **State Management** | ~30 fields | ~20 documented | 33% missing |
| **Device Info** | ~25 fields | ~20 documented | 20% missing |
| **Configuration** | ~200+ fields | ~160 documented | 20% missing (mainly field name mismatches) |
| **Live Features** | Full implementation | Documented | ✅ Complete |
| **Effects/Palettes** | Metadata + data | Names only | 50% missing |

### Rust Library Alignment

The Rust `wled-json-api-library` appears to have **field alignment issues** with the actual WLED API:

1. **Configuration field name mismatches** (e.g., `ethernet.relay` vs `ethernet.type`)
2. **Limited state field coverage** (missing `ledmap`, `error`, `sgrp`, `rgrp`, etc.)
3. **No effect metadata support** (missing `/json/fxda` endpoint)
4. **No pagination support for palettes** (missing `/json/palx` endpoint)
5. **Missing combined endpoints** (missing `/json/si` endpoint)

**Note**: The extensive existing configuration schemas suggest the library may be based on an older WLED version or incomplete documentation rather than direct code analysis.

## Recommendations

**Priority Shift**: Given the discovery of extensive existing configuration schemas, the focus should shift from **creation** to **validation and alignment**.

### Phase 1: Critical Missing Endpoints
1. Add `/json/si` (state+info combined)
2. Add `/json/fxda` (effect metadata)
3. Add `/json/palx` (paginated palettes with color data)
4. Add `/json` (complete API)

### Phase 2: State Object Completion
1. Add missing core state fields (`ledmap`, `error`)
2. Complete nightlight object (`rem` field)
3. Complete UDP sync object (`sgrp`, `rgrp` fields)
4. Complete segment object (`lc`, `len` fields)

### Phase 3: Configuration Schema Field Validation
1. **Fix field name mismatches** (e.g., `ethernet.relay` → `ethernet.type`)
2. **Verify all existing schemas** against actual implementation
3. **Add missing fields** within existing schema structures
4. **Test schema validation** with real WLED device responses

### Phase 4: Enhanced Device Info
1. Add platform-specific fields (`cn`, `release`, `clock`, `flash`, `ndc`)
2. Document all capability flags and bitfields
3. Add build configuration information

## Testing and Validation

To validate schema completeness:

1. **Capture actual API responses** from different WLED builds
2. **Compare with schema definitions** systematically
3. **Test with various hardware configurations** (ESP32, ESP8266, with/without features)
4. **Validate against Rust library expectations**

This analysis reveals that while the OpenAPI schema has **much better coverage than initially assessed**, focused work is needed on **field alignment validation** and **missing endpoint documentation** to achieve full parity with the actual WLED JSON API implementation.

**Key Insight**: The discovery of 35 existing configuration schema files fundamentally changes the scope from wholesale schema development to targeted field validation and gap filling. 