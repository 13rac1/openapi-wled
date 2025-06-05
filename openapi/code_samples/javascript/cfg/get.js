// Get complete WLED device configuration using fetch API
async function getWledConfig(deviceIp = '192.168.1.100') {
  try {
    const response = await fetch(`http://${deviceIp}/json/cfg`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const config = await response.json();
    console.log('WLED Configuration:', config);
    return config;
  } catch (error) {
    console.error('Error getting WLED config:', error);
    throw error;
  }
}

// Usage example
getWledConfig()
  .then(config => {
    console.log('Device name:', config.id?.name);
    console.log('WiFi SSID:', config.nw?.ins?.[0]?.ssid);
    console.log('LED count:', config.hw?.led?.total);
    console.log('Max power:', config.hw?.led?.maxpwr);
    console.log('Default preset:', config.def?.ps);
  })
  .catch(error => console.error('Failed to get config:', error)); 