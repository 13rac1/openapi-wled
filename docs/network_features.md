# WLED Network Features

## Node Discovery

WLED devices can discover each other on the local network using mDNS/DNS-SD (Bonjour) protocol. The `/json/nodes` endpoint provides information about discovered WLED nodes.

### Discovery Process
1. WLED devices advertise themselves using the service type `_wled._tcp.local`
2. Each device broadcasts:
   - Device name
   - Hardware type (ESP8266/ESP32)
   - IP address
   - Version ID
   - Age of discovery record

### Node Types
- ESP8266 (type: 82)
- ESP32 (type: 32)
- ESP32-S2 (type: 33)
- ESP32-S3 (type: 34)
- ESP32-C3 (type: 35)

## Network Scanning

The `/json/net` endpoint allows WLED to scan for available WiFi networks. This is useful for:
- Initial device setup
- Changing network connections
- Diagnosing connectivity issues

### Network Information
Each discovered network includes:
- SSID (network name)
- RSSI (signal strength in dBm)
- BSSID (access point MAC address)
- Channel number (1-14)
- Encryption type

### Encryption Types
- WIFI_AUTH_OPEN - Open network, no encryption
- WIFI_AUTH_WEP - Legacy WEP encryption (not recommended)
- WIFI_AUTH_WPA_PSK - WPA Personal
- WIFI_AUTH_WPA2_PSK - WPA2 Personal (recommended)
- WIFI_AUTH_WPA_WPA2_PSK - Mixed mode WPA/WPA2
- WIFI_AUTH_WPA2_ENTERPRISE - WPA2 Enterprise
- WIFI_AUTH_MAX - Reserved

## Multi-Device Synchronization

WLED devices can synchronize their effects and states:

### Sync Modes
1. UDP Sync
   - Real-time state sync between devices
   - Low latency for light effects
   - Supports master/slave configuration

2. Network Sync Groups
   - Devices can be grouped for synchronized updates
   - Useful for room-based or zone-based control

## Troubleshooting

### Common Issues

1. Node Discovery Failures
   - Ensure devices are on same network subnet
   - Check mDNS/Bonjour service is running
   - Verify firewall settings allow mDNS traffic
   - Age field > 0 indicates stale discovery record

2. Network Scanning Issues
   - ESP8266 has limited scan capabilities
   - Scanning temporarily interrupts LED output
   - Hidden networks won't appear in scan results
   - Signal strength (RSSI) below -80dBm may be unreliable

3. Sync Problems
   - Verify all devices have matching firmware versions
   - Check UDP ports are not blocked
   - Ensure master device is reachable by all slaves
   - Network latency can affect sync quality

### Best Practices

1. Network Setup
   - Use static IP addresses for reliable discovery
   - Place devices on 2.4GHz network for better range
   - Avoid crowded WiFi channels
   - Keep firmware versions consistent across devices

2. Performance
   - Minimize number of sync groups
   - Consider wired network for critical installations
   - Monitor network traffic for bandwidth issues
   - Use appropriate sync intervals for your setup 