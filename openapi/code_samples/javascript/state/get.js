// Get current WLED device state using fetch API
async function getWledState(deviceIp = '192.168.1.100') {
  try {
    const response = await fetch(`http://${deviceIp}/json/state`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const state = await response.json();
    console.log('Current WLED state:', state);
    return state;
  } catch (error) {
    console.error('Error getting WLED state:', error);
    throw error;
  }
}

// Usage
getWledState()
  .then(state => {
    console.log('Device is', state.on ? 'on' : 'off');
    console.log('Brightness:', state.bri);
  })
  .catch(error => console.error('Failed to get state:', error)); 