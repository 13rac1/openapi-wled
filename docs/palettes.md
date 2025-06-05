# WLED Color Palettes Documentation

## Overview
Color palettes in WLED provide predefined color schemes that can be used with effects. Palettes are identified by their index in the palettes array, which can be retrieved from the `/json/pal` endpoint.

## Palette Categories

### Basic Palettes
- **Default**: Standard RGB color space
- **Random Cycle**: Randomly generated colors
- **Primary Color**: Single color from primary
- **Primary & Secondary**: Two-color combination
- **Color Gradient**: Smooth transition between colors

### Nature-Inspired
- **Party**: Vibrant party colors
- **Cloud**: Soft, ethereal blues and whites
- **Lava**: Hot reds and oranges
- **Ocean**: Deep blues and aqua tones
- **Forest**: Natural greens and browns

### Mood & Atmosphere
- **Sunset**: Warm evening colors
- **Rivendell**: Ethereal fantasy colors
- **Breeze**: Cool, refreshing tones
- **Analogous**: Harmonious color combinations
- **Vintage**: Muted, retro colors

### Special Palettes
- **Temperature**: Cold to hot color mapping
- **Aurora**: Northern lights colors
- **Sakura**: Cherry blossom tones
- **Fire**: Flame color variations
- **Ice**: Cold color variations

## Color Format Specifications

### RGB Color Format
```json
{
  "col": [
    [255, 0, 0],    // Red
    [0, 255, 0],    // Green
    [0, 0, 255]     // Blue
  ]
}
```

### RGBW Color Format
```json
{
  "col": [
    [255, 0, 0, 0],    // Red with no white
    [0, 255, 0, 128],  // Green with 50% white
    [0, 0, 255, 255]   // Blue with full white
  ]
}
```

## Palette Blending Modes

1. **Wrap When Moving (Mode 0)**
   - Colors wrap around at palette boundaries
   - Smooth transitions between start and end
   - Best for continuous effects

2. **Always Wrap (Mode 1)**
   - Forces color wrapping
   - Creates repeating patterns
   - Useful for cyclic effects

3. **Never Wrap (Mode 2)**
   - Colors stop at palette boundaries
   - No transition between end and start
   - Good for defined color segments

4. **None/Undefined (Mode 3)**
   - Default behavior
   - Implementation-specific
   - May vary by effect

## Usage Examples

### Basic Palette Application
```json
{
  "seg": [{
    "id": 0,
    "pal": 0,        // Default palette
    "col": [
      [255, 0, 0],   // Primary color (Red)
      [0, 255, 0],   // Secondary color (Green)
      [0, 0, 255]    // Tertiary color (Blue)
    ]
  }]
}
```

### Advanced Palette Configuration
```json
{
  "seg": [{
    "id": 0,
    "pal": 8,        // Ocean palette
    "fx": 10,        // Effect using palette
    "sx": 128,       // Effect speed
    "ix": 255        // Effect intensity
  }]
}
```

## Integration with Effects

### Compatible Effects
- Color Gradient
- Rainbow
- Color Cycle
- Fire
- Ocean Wave
- And many more...

### Effect-Specific Behavior
1. **Solid Effects**
   - Use primary color from palette
   - Ignore additional colors

2. **Moving Effects**
   - Transition through palette colors
   - Speed affects transition rate

3. **Pattern Effects**
   - May use multiple palette colors
   - Create patterns based on palette order

## Performance Considerations

1. **Memory Usage**
   - Built-in palettes use program memory
   - Custom palettes use RAM
   - Consider available memory when creating custom palettes

2. **Processing Impact**
   - Palette transitions require calculation
   - RGBW adds processing overhead
   - Balance complexity with performance

## Custom Palette Guidelines

1. **Color Selection**
   - Use harmonious color combinations
   - Consider color theory principles
   - Test with different effects

2. **Transition Smoothness**
   - Ensure smooth color gradients
   - Avoid jarring color changes
   - Test with different speeds

3. **Memory Efficiency**
   - Reuse common palettes
   - Limit custom palette count
   - Share palettes between segments

## Compatibility Notes

1. **Hardware Support**
   - All devices support basic palettes
   - RGBW requires compatible LED strips
   - Custom palettes require sufficient RAM

2. **Version Differences**
   - Palette IDs stable across versions
   - Newer versions may add palettes
   - Check `/json/info` for palette counts 