// Update WLED device configuration using fetch API
// WARNING: Configuration changes can make device inaccessible
async function updateWledConfig(deviceIp = '192.168.1.100', configUpdate) {
  try {
    const response = await fetch(`http://${deviceIp}/json/cfg`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(configUpdate)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('WLED config updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating WLED config:', error);
    throw error;
  }
}

// Usage examples
const examples = {
  // Change device name
  updateName: () => updateWledConfig('192.168.1.100', {
    id: {
      name: "Living-Room-WLED"
    }
  }),
  
  // Update default settings
  updateDefaults: () => updateWledConfig('192.168.1.100', {
    def: {
      ps: 2,      // Default preset
      on: true,   // Turn on at boot
      bri: 200    // Default brightness
    }
  }),
  
  // Configure power limiting
  updatePowerLimit: () => updateWledConfig('192.168.1.100', {
    light: {
      "scale-bri": 80  // Limit brightness to 80%
    },
    hw: {
      led: {
        maxpwr: 750  // Max power in milliwatts
      }
    }
  }),
  
  // Update network settings (use with extreme caution!)
  updateNetwork: () => updateWledConfig('192.168.1.100', {
    nw: {
      ins: [{
        ssid: "NewWiFiNetwork",
        ip: [0, 0, 0, 0],  // Use DHCP
        gw: [192, 168, 1, 1],
        sn: [255, 255, 255, 0]
      }]
    }
  }),
  
  // Configure access point
  updateAP: () => updateWledConfig('192.168.1.100', {
    ap: {
      ssid: "MyCustomWLED",
      chan: 6,
      behav: 1  // Open when no connection
    }
  })
};

// Example: Update device name
examples.updateName()
  .then(result => console.log('Device name updated:', result))
  .catch(error => console.error('Failed to update name:', error));

// WARNING: Always backup configuration before making changes!
console.warn('⚠️  Configuration changes can make your device inaccessible!');
console.warn('⚠️  Always backup your configuration before making changes!');
console.warn('⚠️  Test changes carefully, especially network settings!'); 