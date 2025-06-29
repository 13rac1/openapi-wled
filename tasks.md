# Tasklist

- [x] Read the `README.md` to understand what the project is.
- [x] Confirm the git repository is initialized and clean.
- [x] Create `.ai/redocly-cli.md` describing the use of the CLI tool available
      at: https://github.com/redocly/redocly-cli
- [x] Create `.ai/openapi-3.0.md` describing the OpenAPI 3.0 Schema standard.
- [x] Create `.ai/multi-file-definitions.md` describing the use of
      multi-file-definitions.
- [X] Clone `https://github.com/paul-fornage/wled-json-api-library.git` as a submodule
      and commit the change.
- [x] Review the AI documentation in `.ai/docs/*.md` and the `README.md`, then generate a plan of iterative
      tasks in this document `tasks.md` to create a Redocly multi-file OpenAPI 3 Schema based on the Rust
      code in `wled-json-api-library` according to the AI documentation and the `README.md`
- [x] Verify compatibility with WLED 14.0+ as noted in library README
- [X] Please read the @openapi-3.0.md and @multi-file-definitions.md and @README.md Then verify the entire OpenAPI schema in `./openapi` compared to the Rust code in `./wled-json-api-library/src/` Confirm all paths, structures, and field types match the Rust code.

## OpenAPI Schema Creation Plan

### Initial Setup Phase
- [x] Initialize the OpenAPI project structure following the multi-file format
- [x] Create the root `openapi.yaml` file with basic API information
- [x] Set up the folder structure for components, paths, and code samples
- [x] Configure `.redocly.yaml` for linting and documentation settings

### Major API Feature Endpoints (from wled-json-api-library analysis)

Based on the Rust library analysis, the WLED JSON API has these major feature endpoints:

1. **State Management** (`/json/state`)
   - GET: Retrieve current device state (brightness, on/off, effects, segments, etc.)
   - POST: Update device state

2. **Configuration Management** (`/json/cfg`)
   - GET: Retrieve device configuration 
   - POST: Update device configuration (network, hardware, defaults, etc.)

3. **Device Information** (`/json/info`)
   - GET: Retrieve device info (version, hardware details, capabilities)

4. **Effects Management** (`/json/eff`)
   - GET: Retrieve available effects list

5. **Color Palettes** (`/json/pal`)
   - GET: Retrieve available color palettes

6. **Network Discovery** (`/json/nodes`)
   - GET: Retrieve discovered WLED nodes on network

7. **Network Information** (`/json/net`)
   - GET: Retrieve network configuration and status

8. **Live Data** (`/json/live`)
   - GET: Retrieve live/realtime data stream information

### Iterative Development Process

#### Documentation to Review for Each Iteration
For each major API feature group, review these documents before starting:
- `.ai/docs/openapi-3.0.md` - OpenAPI schema standards and requirements
- `.ai/docs/multi-file-definitions.md` - File organization and $ref usage
- `.ai/docs/redocly-cli.md` - CLI commands for validation and building
- `wled-json-api-library/README.md` - API usage examples and compatibility notes
- Relevant Rust structure files in `wled-json-api-library/src/structures/`

#### Iteration 1: State Management (`/json/state`)
1. Analysis Phase
   - [x] Review `wled-json-api-library/src/structures/state.rs` for data structures
   - [x] Review `wled-json-api-library/src/wled.rs` methods: `get_state_from_wled()`, `flush_state()`
   - [x] Identify:
     - [x] State properties (on/off, brightness, effects, segments, etc.)
     - [x] Request/response data structures for GET and POST operations
     - [x] Error responses and status codes
     - [x] Query parameters and optional fields

2. Schema Creation Phase
   - [x] Create `components/schemas/State.yaml` - main state object schema
   - [x] Create `components/schemas/Segment.yaml` - segment configuration schema
   - [x] Create `components/schemas/StateResponse.yaml` - GET response wrapper
   - [x] Create `components/schemas/StateRequest.yaml` - POST request schema
   - [x] Create `paths/json_state.yaml` - GET and POST operations
   - [x] Define common error responses in `components/responses/`

3. Documentation Phase
   - [x] Add detailed descriptions for all state properties
   - [x] Include examples from the Rust library usage
   - [x] Add code samples for state operations
   - [x] Document valid ranges and constraints

4. Validation Phase
   - [x] Run `npm test` to validate schema
   - [x] Run `npm start` to preview documentation
   - [x] Fix any validation errors

#### Iteration 2: Configuration Management (`/json/cfg`)
1. Analysis Phase
   - [x] Review `wled-json-api-library/src/structures/cfg/` directory structure
   - [x] Review configuration sub-modules (def, hw, network, etc.)
   - [x] Review `wled-json-api-library/src/wled.rs` methods: `get_cfg_from_wled()`, `flush_config()`
   - [x] Identify:
     - [x] Hardware configuration options
     - [x] Network settings (WiFi, Ethernet, AP mode)
     - [x] Default behavior settings
     - [x] Interface and remote control settings

2. Schema Creation Phase - Core Structure
   - [x] Create `components/schemas/Config.yaml` - main configuration object (placeholder)
   - [x] Create `paths/json_cfg.yaml` - GET and POST operations
   - [x] Update common error responses
   - [x] Create `components/schemas/ConfigResponse.yaml` and `ConfigRequest.yaml`

3. Schema Creation Phase - Detailed Component Schemas
   - [x] Implement detailed `components/schemas/config/Config.yaml` based on Rust Cfg struct
   - [x] Implement `components/schemas/config/AccessPointConfig.yaml` from cfg_ap.rs
   - [x] Implement `components/schemas/config/DefaultConfig.yaml` from cfg_def.rs
   - [x] Implement `components/schemas/config/DmxConfig.yaml` from cfg_dmx.rs
   - [x] Implement `components/schemas/config/EthernetConfig.yaml` from cfg_eth.rs
   - [x] Implement `components/schemas/config/HardwareConfig.yaml` from cfg_hw/mod.rs
   - [x] Implement `components/schemas/config/LedConfig.yaml` from cfg_hw/cfg_hw_led.rs (Note: LED config is implemented as part of HardwareConfig.yaml since it's not a standalone schema in the Rust code)
   - [x] Implement `components/schemas/config/DeviceIdentification.yaml` from cfg_id.rs
   - [x] Implement `components/schemas/config/InterfaceConfig.yaml` from cfg_if2.rs
   - [x] Implement `components/schemas/config/LightConfig.yaml` from cfg_light.rs
   - [x] Implement `components/schemas/config/NetworkConfig.yaml` from cfg_nw.rs
   - [x] Implement `components/schemas/config/AnalogClock.yaml` from cfg_ol.rs
   - [x] Implement `components/schemas/config/OtaConfig.yaml` from cfg_ota.rs
   - [x] Implement `components/schemas/config/RemoteConfig.yaml` from cfg_remote.rs
   - [x] Implement `components/schemas/config/TimersConfig.yaml` from cfg_timers.rs
   - [x] Implement `components/schemas/config/WifiConfig.yaml` from cfg_wifi.rs

4. Documentation Phase
   - [x] Document configuration categories and their purposes
   - [x] Add examples for common configuration scenarios
   - [x] Include warnings about dangerous configuration changes
   - [x] Document backup/restore considerations

5. Validation Phase
   - [x] Run validation and preview tools with detailed schemas
   - [x] Test configuration examples with all components
   - [x] Fix any issues with detailed implementations

#### Iteration 3: Device Information (`/json/info`)
1. Analysis Phase
   - [x] Review `wled-json-api-library/src/structures/info.rs`
   - [x] Review `get_info_from_wled()` method
   - [x] Identify:
     - [x] Version information (firmware, build)
     - [x] Hardware capabilities and limitations
     - [x] Runtime statistics and status
     - [x] Feature availability flags

2. Schema Creation Phase
   - [x] Create `components/schemas/DeviceInfo.yaml`
   - [x] Create `components/schemas/VersionInfo.yaml`
   - [x] Create `components/schemas/HardwareInfo.yaml`
   - [x] Create `paths/json_info.yaml` - GET operation only
   - [x] Define read-only property specifications

3. Documentation Phase
   - [x] Document version compatibility information
   - [x] Add examples of different hardware configurations
   - [x] Document capability flags and their meanings
   - [x] Document WLED version differences

4. Validation Phase
   - [x] Run validation and preview tools with detailed schemas
   - [x] Test configuration examples with all components
   - [x] Fix any issues with detailed implementations

#### Iteration 4: Effects and Palettes (`/json/eff`, `/json/pal`)
1. Analysis Phase
   - [x] Review `wled-json-api-library/src/structures/effects.rs`
   - [x] Review `wled-json-api-library/src/structures/palettes.rs`
   - [x] Review corresponding getter methods
   - [x] Identify:
     - [x] Effect list structure and metadata
     - [x] Palette list structure and color data
     - [x] Effect parameters and capabilities

2. Schema Creation Phase
   - [x] Create `components/schemas/Effects.yaml`
   - [x] Create `components/schemas/Effect.yaml`
   - [x] Create `components/schemas/Palettes.yaml`
   - [x] Create `components/schemas/Palette.yaml`
   - [x] Create `paths/json_eff.yaml` and `paths/json_pal.yaml`

3. Documentation Phase
   - [x] Document effect categories and behaviors
   - [x] Add palette color format specifications
   - [x] Include visual examples where applicable

4. Validation Phase
   - [x] Validate effect and palette data structures

#### Iteration 5: Network Features (`/json/nodes`, `/json/net`)
1. Analysis Phase
   - [x] Review `wled-json-api-library/src/structures/nodes.rs`
   - [x] Review `wled-json-api-library/src/structures/net.rs`
   - [x] Review corresponding getter methods
   - [x] Identify:
     - [x] Node discovery protocol and data
     - [x] Network status and configuration
     - [x] Multi-device coordination features

2. Schema Creation Phase
   - [x] Create network-related schemas
   - [x] Create node discovery schemas
   - [x] Create corresponding path definitions

3. Documentation Phase
   - [x] Document network discovery mechanisms
   - [x] Explain multi-device synchronization
   - [x] Add network troubleshooting information

4. Validation Phase
   - [x] Test with multiple WLED devices
   - [x] Validate network configuration scenarios
   - [x] Run validation and preview tools with detailed schemas
   - [x] Test configuration examples with all components
   - [x] Fix any issues with detailed implementations

#### Iteration 6: Live Data and Streaming (`/json/live`)
1. Analysis Phase
   - [x] Review `wled-json-api-library/src/structures/live.rs`
   - [x] Review streaming capabilities and limitations
   - [x] Note: The library README mentions JSON streaming "sucks and is slow"
   - [x] Identify real-time data structures

2. Schema Creation Phase
   - [x] Create live data schemas
   - [x] Document streaming limitations
   - [x] Create appropriate path definitions

3. Documentation Phase
   - [x] Document streaming alternatives (DDP protocol)
   - [x] Add performance considerations
   - [x] Include usage recommendations

4. Validation Phase
   - [x] Run validation and preview tools with detailed schemas
   - [x] Test configuration examples with all components
   - [x] Fix any issues with detailed implementations

### Finalization Phase
- [x] Bundle the complete multi-file definition
- [x] Generate comprehensive API documentation
- [x] Create final validation report
- [x] Update project README with schema information
- [x] Create usage examples and code samples

## Schema-Implementation Alignment Tasks

Based on the analysis in `docs/implementation-vs-schema-gaps.md`, the following tasks are needed to bring the OpenAPI schema to full parity with the actual WLED JSON API implementation:

### Phase 1: Missing API Endpoints

#### Task 1.1: Add Combined State + Info Endpoint
- [x] Create `paths/json_si.yaml` for `/json/si` endpoint
- [x] Define GET operation returning combined state and info objects
- [x] Create response schema `components/schemas/StateInfoResponse.yaml`
- [x] Add path reference to main `openapi.yaml`
- [x] Add code samples and documentation

#### Task 1.2: Add Effect Data Endpoint  
- [x] Create `paths/json_fxda.yaml` for `/json/fxda` endpoint
- [x] Define GET operation returning array of effect metadata
- [x] Create response schema `components/schemas/EffectDataResponse.yaml`
- [x] Document effect metadata format (data after '@' character)
- [x] Add path reference to main `openapi.yaml`

#### Task 1.3: Add Paginated Palette Endpoint
- [x] Create `paths/json_palx.yaml` for `/json/palx` endpoint
- [x] Define GET operation with optional `page` query parameter
- [x] Create response schema `components/schemas/PaginatedPalettesResponse.yaml`
- [x] Document pagination structure with `m` (max pages) and `p` (palette data)
- [x] Include color data arrays vs simple names
- [x] Add path reference to main `openapi.yaml`

#### Task 1.4: Add Base JSON Endpoint
- [x] Create `paths/json.yaml` for `/json` endpoint (no suffix)
- [x] Define GET operation returning complete API data
- [x] Create response schema `components/schemas/CompleteApiResponse.yaml`
- [x] Include state, info, effects, and palette names
- [x] Add path reference to main `openapi.yaml`

### Phase 2: State Object Field Completion

#### Task 2.1: Add Missing Core State Fields
- [x] Add `ledmap` field to `components/schemas/State.yaml`
  - Type: `integer`
  - Description: "Current LED map ID"
  - ReadOnly: `true`
- [x] Add `error` field to `components/schemas/State.yaml`
  - Type: `integer` 
  - Description: "Error code if present"
  - ReadOnly: `true`

#### Task 2.2: Complete Nightlight Object
- [x] Add `rem` field to `components/schemas/Nightlight.yaml`
  - Type: `integer`
  - Description: "Remaining time in seconds (-1 if inactive)"
  - ReadOnly: `true`

#### Task 2.3: Complete UDP Sync Object
- [x] Add `sgrp` field to `components/schemas/UdpSync.yaml`
  - Type: `integer`
  - Description: "Sync groups (bitfield)"
- [x] Add `rgrp` field to `components/schemas/UdpSync.yaml`
  - Type: `integer` 
  - Description: "Receive groups (bitfield)"

#### Task 2.4: Complete Segment Object
- [x] Add `lc` field to `components/schemas/Segment.yaml`
  - Type: `integer`
  - Description: "Light capabilities bitfield"
  - ReadOnly: `true`
- [x] Add `len` field to `components/schemas/Segment.yaml`
  - Type: `integer`
  - Description: "Segment length (calculated from stop-start)"
  - ReadOnly: `true`

### Phase 3: Configuration Schema Field Validation (35 Files)

#### Task 3.1: Setup Systematic Validation Process
- [x] Create validation suite framework structure (`validation/` directory)
- [x] Set up test WLED device for comprehensive API data capture (ESP32 with Ethernet at 10.0.0.100)
- [x] Create data collection script (`validation/scripts/collect-data.js`)
  - [x] Capture all 13 JSON API endpoints successfully 
  - [x] Implement retry logic and error handling
  - [x] Real-world data collection from WLED v0.15.0 ESP32_Ethernet device
- [x] Create comprehensive data sanitization framework (`validation/scripts/sanitize-data.js`)
  - [x] Pattern-based sensitive data detection and replacement
  - [x] All sensitive data properly sanitized (SSIDs, MAC addresses, IPs, passwords, device names)
  - [x] Context-aware sanitization for nested structures and arrays
- [x] Integrate npm script automation (`validate:collect`, `validate:sanitize`)
- [x] Create validation documentation (`validation/README.md`)
- [x] Setup git security (`.gitignore` excludes sensitive `captured-data/`, commits safe `sanitized-data/`)
- [x] Create validation script/tool to systematically compare captured JSON vs OpenAPI schemas
- [x] Create configuration validation matrix spreadsheet covering all endpoints
- [x] Build schema validation comparison tooling
- [x] Generate automated validation reports identifying:
  - [x] Missing fields in schemas  
  - [x] Incorrect field types or constraints
  - [x] Extra fields in schemas not in implementation
  - [x] Field name mismatches
  - [x] Platform-specific conditional fields
- [x] Document complete validation methodology and criteria

#### Task 3.2: Core Configuration Structure Validation
*Use captured `validation/sanitized-data/esp32-ethernet/config.json` for validation*
- [x] `Config.yaml` - Main configuration wrapper structure
- [x] `ConfigRequest.yaml` - POST request structure  
- [x] `ConfigResponse.yaml` - GET response structure

#### Task 3.3: Network Configuration Validation (High Priority)
- [x] `NetworkConfig.yaml` - Main network configuration
- [x] `NetworkInstance.yaml` - Individual WiFi network instances
- [x] `WifiConfig.yaml` - WiFi-specific settings 
- [x] `AccessPointConfig.yaml` - AP mode configuration
- [x] `EthernetConfig.yaml` - **KNOWN ISSUE**: Change `relay` → `type`, verify enums

#### Task 3.4: Hardware Configuration Validation (High Priority)
- [x] HardwareConfig.yaml
  - [x] LED configuration
  - [x] Communication settings
  - [x] Button configuration
  - [x] Infrared settings
  - [x] Relay configuration
  - [x] Interface configuration
- [x] LedConfig.yaml
  - [x] Total LED count
  - [x] Power limit
  - [x] LED matrix
  - [x] Individual LED control
  - [x] LED segments
- [x] RelayConfig.yaml
  - [x] Pin configuration
  - [x] Reverse logic
  - [x] Open drain output

#### Task 3.5: Interface Configuration Validation (Medium Priority)
- [x] `InterfaceConfig.yaml` - Main interface wrapper
- [x] `SyncConfig.yaml` - UDP sync configuration
  - [x] Check sync port configurations
  - [x] Verify group settings
- [x] `MqttConfig.yaml` - MQTT broker configuration
  - [x] Verify MQTT settings structure
  - [x] Check topic configurations
- [x] `HueConfig.yaml` - Philips Hue integration
- [x] `NtpConfig.yaml` - NTP time synchronization
  - [x] Validate NTP configuration fields
- [x] `LiveConfig.yaml` - Real-time data streaming
- [x] `DmxConfig.yaml` - DMX protocol configuration
- [x] `NodesConfig.yaml` - Node discovery settings
- [x] `VoiceAssistantConfig.yaml` - Alexa integration

#### Task 3.6: Behavior Configuration Validation (Medium Priority)
- [x] `LightConfig.yaml` - Light behavior settings
  - Verify gamma correction structure
  - Check transition settings
- [x] `GammaCorrection.yaml` - Gamma correction specifics
- [x] `TransitionConfig.yaml` - Transition timing
  - [x] Fixed pal field type to boolean
  - [x] Removed unused mode field
  - [x] Clarified duration units (centiseconds)
- [x] `NightlightConfig.yaml` - Nightlight behavior
  - [x] Added detailed mode descriptions
  - [x] Clarified duration behavior for each mode
  - [x] Added note about macro execution timing
  - [x] Added sunrise/sunset mode specifics
- [x] `DefaultConfig.yaml` - Boot-up defaults
  - [x] Clarified preset number range (0 = no preset, 1-250 = preset number)
  - [x] Added note about LED state when turnOnAtBoot is false
  - [x] Added detail about default brightness behavior
  - [x] Updated example to show default state
- [x] `AnalogClock.yaml` - Clock display settings
  - [x] Added missing osb field for solid black mode
  - [x] Improved field descriptions for clarity
  - [x] Clarified min/max LED boundaries
  - [x] Added note about 12 o'clock position
- [x] `TimersConfig.yaml` - **COMPLEX**: Scheduling and automation
  - [x] Verify timer instance structures
  - [x] Check countdown configuration
  - [x] Validate scheduling fields
  - [x] Fixed goal field to be array type

#### Task 3.7: Device Configuration Validation (Low Priority)
- [x] `DeviceIdentification.yaml` - Device naming and mDNS
- [x] `OtaConfig.yaml` - Over-the-air update settings
- [x] `RemoteConfig.yaml` - Remote control settings
- [x] `ColorOrderMap.yaml` - LED color order mapping
- [x] Security Configuration Validation
  - [x] Verify security configuration structure
  - [x] Check PIN configuration
  - [x] Validate OTA settings
  - [x] Add missing SecurityConfig.yaml schema
  - [x] Add SecurityConfig reference to Config.yaml

#### Task 3.8: Extended Configuration Validation Testing
*Primary validation can begin immediately with existing sanitized data*
- [x] Capture actual `/json/cfg` responses from ESP32 with Ethernet ✅ (`validation/sanitized-data/esp32-ethernet/`)
- [ ] Capture additional device configurations:
  - [ ] ESP8266 basic configuration  
  - [ ] ESP32 with 2D matrix
  - [ ] Different usermod configurations
- [x] Run schema validation against captured responses
- [x] Document validation failures and required fixes
- [x] Create automated validation test suite

### Phase 4: Device Information Completion

#### Task 4.1: Add Missing Platform-Specific Fields
- [x] Add `cn` field to `components/schemas/DeviceInfoResponse.yaml`
  - Type: `string`
  - Description: "Codename"
  - ReadOnly: `true`
- [x] Add `release` field to `components/schemas/DeviceInfoResponse.yaml`
  - Type: `string`
  - Description: "Release information"
  - ReadOnly: `true`
- [x] Add `clock` field to `components/schemas/DeviceInfoResponse.yaml`
  - Type: `integer`
  - Description: "CPU frequency in MHz"
  - ReadOnly: `true`
- [x] Add `flash` field to `components/schemas/DeviceInfoResponse.yaml`
  - Type: `integer`
  - Description: "Flash memory size in MB"
  - ReadOnly: `true`
- [x] Add `ndc` field to `components/schemas/DeviceInfoResponse.yaml`
  - Type: `integer`
  - Description: "Node discovery count (-1 if disabled)"
  - ReadOnly: `true`

#### Task 4.2: Platform-Specific Conditional Fields
- [x] Document ESP32 vs ESP8266 specific fields
- [x] Add conditional schema support for different builds
- [x] Include feature availability flags documentation

#### Task 5.2: Documentation Finalization
- [ ] Update `README.md` with schema completion status
- [ ] Document known limitations and issues
- [ ] Create troubleshooting guide
