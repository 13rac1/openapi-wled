# Live Data Streaming

## ⚠️ Important Notice

The JSON-based live data streaming feature (`/json/live`) in WLED is **incomplete and not recommended for use**. This endpoint was an experimental feature that has been superseded by more efficient protocols.

## Limitations of JSON Streaming

1. Performance Issues
   - High latency due to JSON parsing overhead
   - Inefficient for real-time LED control
   - Increased network bandwidth usage
   - Poor synchronization between multiple devices

2. Implementation Status
   - Incomplete feature implementation
   - Limited functionality
   - No guaranteed stability
   - May be removed in future versions

## Recommended Alternative: DDP Protocol

For real-time LED control, use the DDP (Distributed Display Protocol) instead:

### DDP Benefits
- Lower latency
- More efficient data transfer
- Better synchronization
- Purpose-built for LED control
- Stable and well-tested

### Using DDP
1. Enable UDP port 4048 on your network
2. Configure WLED to accept DDP input
3. Send raw LED data using the DDP protocol
4. Optionally use E1.31 for DMX-style control

## Technical Details

### Current JSON Implementation
```json
{
  "leds": ["#FF0000", "#00FF00"],  // LED color values
  "n": 2                           // Number field (undefined purpose)
}
```

### DDP Protocol Reference
For detailed information about using DDP with WLED, see:
https://github.com/Aircoookie/WLED/wiki/UDP-Realtime-Control

## Future Development

The JSON streaming feature may be:
- Removed in future versions
- Replaced with WebSocket support
- Enhanced with better performance
- Maintained only for legacy support

For new implementations, always use DDP or other recommended protocols for real-time control. 