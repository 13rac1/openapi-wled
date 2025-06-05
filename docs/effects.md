# WLED Effects Documentation

## Overview
WLED provides a rich set of LED effects that can be applied to individual segments or the entire LED strip. Effects are identified by their index in the effects array, which can be retrieved from the `/json/eff` endpoint.

## Effect Categories

### Basic Effects
- **Solid**: Static color display
- **Blink**: Simple on/off blinking
- **Breathe**: Smooth brightness pulsing
- **Wipe**: Color transition that moves across the strip
- **Random Colors**: Random color changes

### Movement Effects
- **Sweep**: Smooth color movement across the strip
- **Scanner**: Moving dot pattern
- **Chase**: Moving block pattern
- **Running**: Continuous movement pattern
- **Wave**: Various wave-like movements

### Color Transitions
- **Colorloop**: Continuous color cycling
- **Rainbow**: Full spectrum transitions
- **Fade**: Smooth color fading
- **Gradient**: Color gradient effects
- **Palette**: Color transitions using predefined palettes

### Dynamic Effects
- **Dynamic**: Reactive changes
- **Theater**: Theater marquee style
- **Twinkle**: Random sparkling
- **Sparkle**: Quick flash effects
- **Strobe**: Rapid on/off patterns

### Nature Simulations
- **Fire**: Flame simulation effects
- **Lightning**: Lightning strike simulation
- **Cloud**: Cloud-like color transitions
- **Ocean**: Water-like movements
- **Forest**: Natural color variations

### Special Effects
- **Aurora**: Aurora Borealis simulation
- **Fireworks**: Explosion patterns
- **Plasma**: Plasma wave effects
- **Noise**: Various noise-based patterns
- **Matrix**: Digital rain effect

## Effect Parameters

### Common Parameters
1. **Speed (sx)**
   - Range: 0-255
   - Controls the rate of effect animation
   - Higher values = faster movement

2. **Intensity (ix)**
   - Range: 0-255
   - Controls the strength or complexity of the effect
   - Effect-specific behavior

3. **Custom Sliders**
   - **c1**: Primary parameter (0-255)
   - **c2**: Secondary parameter (0-255)
   - **c3**: Tertiary parameter (0-31)
   - Usage varies by effect

4. **Options**
   - **o1**: Primary toggle
   - **o2**: Secondary toggle
   - **o3**: Tertiary toggle
   - Effect-specific behaviors

### Effect-Specific Parameters

#### Fire Effect
- **Intensity**: Controls flame height
- **Custom1**: Sparking rate
- **Custom2**: Cooling rate
- **Option1**: Reverse direction

#### Rainbow Effect
- **Speed**: Rainbow movement rate
- **Intensity**: Color saturation
- **Custom1**: Number of rainbows
- **Option1**: Reverse direction

#### Twinkle Effect
- **Speed**: Twinkle rate
- **Intensity**: Number of twinkles
- **Custom1**: Fade rate
- **Option1**: Random colors

## Usage Examples

### Basic Effect Setup
```json
{
  "seg": [{
    "id": 0,
    "fx": 0,    // Solid effect
    "sx": 128,  // Medium speed
    "ix": 255,  // Full intensity
    "pal": 0    // Default palette
  }]
}
```

### Complex Effect Configuration
```json
{
  "seg": [{
    "id": 0,
    "fx": 66,   // Fire effect
    "sx": 164,  // Faster speed
    "ix": 208,  // High intensity
    "c1": 120,  // Custom sparking
    "c2": 100,  // Custom cooling
    "o1": true, // Reverse direction
    "pal": 8    // Fire palette
  }]
}
```

## Performance Considerations

1. **CPU Impact**
   - Complex effects (Fire, Noise) use more processing power
   - Multiple segments with different effects increase CPU load
   - Consider using simpler effects for long LED strips

2. **Memory Usage**
   - Some effects require additional memory buffers
   - Memory usage scales with LED count
   - Consider available RAM when using complex effects

3. **Refresh Rate**
   - Target FPS can be configured in device settings
   - Complex effects may reduce achievable FPS
   - Balance effect complexity with desired smoothness

## Compatibility Notes

1. **Hardware Requirements**
   - All effects work on ESP8266 and ESP32
   - Some effects perform better on ESP32
   - Available RAM affects maximum LED count

2. **Version Differences**
   - Effect IDs are stable across versions
   - Newer versions may add additional effects
   - Check `/json/info` for available effect count 