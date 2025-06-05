// Update WLED device state using fetch API
async function updateWledState(deviceIp = '192.168.1.100', stateUpdate) {
  try {
    const response = await fetch(`http://${deviceIp}/json/state`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stateUpdate)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('WLED state updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating WLED state:', error);
    throw error;
  }
}

// Usage examples
const examples = {
  // Turn device on with brightness
  turnOn: () => updateWledState('192.168.1.100', {
    on: true,
    bri: 128,
    transition: 7,
    v: true  // Return full state in response
  }),
  
  // Change color to red
  setRed: () => updateWledState('192.168.1.100', {
    seg: [{
      id: 0,
      col: [[255, 0, 0], [0, 0, 0], [0, 0, 0]]
    }],
    v: true
  }),
  
  // Apply preset
  applyPreset: (presetId) => updateWledState('192.168.1.100', {
    ps: presetId,
    v: true
  }),
  
  // Enable nightlight
  enableNightlight: () => updateWledState('192.168.1.100', {
    nl: {
      on: true,
      dur: 60,  // 60 minutes
      mode: 1,  // fade mode
      tbri: 5   // target brightness
    }
  })
};

// Run an example
examples.turnOn()
  .then(result => console.log('Device turned on:', result))
  .catch(error => console.error('Failed to turn on:', error)); 