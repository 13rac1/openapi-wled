import { describe, it, expect, beforeAll } from 'vitest'

// Use environment variable with fallback to default IP
const deviceUrl = process.env.WLED_DEVICE_URL || 'http://10.0.0.100';

// Helper function to wrap callback-style API calls in promises
const promisifyApiCall = (apiCall) => {
  return new Promise((resolve, reject) => {
    apiCall((error, data, response) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    });
  });
};

// Helper function to wait for a specified time
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('WLED API End-to-End Tests', () => {
  let apiClient;
  let infoApi;
  let stateApi;
  let configApi;
  let originalConfig;

  beforeAll(async () => {
    // Dynamically import the ES module client
    const client = await import('../../../client/src/index.js');
    
    // Initialize the API client and its instances
    apiClient = new client.ApiClient();
    apiClient.basePath = deviceUrl;
    
    infoApi = new client.DeviceInformationApi(apiClient);
    stateApi = new client.StateManagementApi(apiClient);
    configApi = new client.ConfigurationManagementApi(apiClient);

    // Get original config for later restoration
    originalConfig = await promisifyApiCall(callback => configApi.getConfig(callback));
  });

  describe('Device Information', () => {
    it('should get device info', async () => {
      const data = await promisifyApiCall(callback => infoApi.getDeviceInfo(callback));
      expect(data).toBeDefined();
      expect(data.ver).toBeDefined();
    });

    it('should get complete API data', async () => {
      const data = await promisifyApiCall(callback => infoApi.getCompleteApi(callback));
      expect(data).toBeDefined();
      expect(data.state).toBeDefined();
      expect(data.info).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should get current state', async () => {
      const data = await promisifyApiCall(callback => stateApi.getState(callback));
      expect(data).toBeDefined();
      expect(data.bri).toBeDefined();
    });

    it('should update state', async () => {
      const newState = { bri: 128, on: true };
      const data = await promisifyApiCall(callback => stateApi.updateState(newState, callback));
      expect(data).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    it('should get current configuration', async () => {
      const data = await promisifyApiCall(callback => configApi.getConfig(callback));
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.id.name).toBeDefined();
    });

    it('should update and restore device name', async () => {
      // Create a unique name with last 8 digits of Unix timestamp
      const timestamp = Date.now().toString().slice(-8);
      const newName = `WLED-${timestamp}`;
      
      // Get initial config
      const initialConfig = await promisifyApiCall(callback => configApi.getConfig(callback));
      expect(initialConfig.id.name).toBeDefined();
      console.log('Current device name:', initialConfig.id.name);

      // Update name
      const updateResponse = await promisifyApiCall(callback => 
        configApi.updateConfig({ id: { name: newName } }, callback)
      );
      console.log('Update response:', updateResponse);

      // Wait for update to take effect
      await wait(500);

      // Verify update
      const updatedConfig = await promisifyApiCall(callback => configApi.getConfig(callback));
      expect(updatedConfig.id.name).toBe(newName);
      console.log('Updated device name:', updatedConfig.id.name);

      // Double check the name is different from original
      expect(updatedConfig.id.name).not.toBe(originalConfig.id.name);
      console.log('Original name:', originalConfig.id.name);
      console.log('New name:', updatedConfig.id.name);

      // Restore original name
      const restoreResponse = await promisifyApiCall(callback => 
        configApi.updateConfig({ id: { name: originalConfig.id.name } }, callback)
      );
      console.log('Restore response:', restoreResponse);

      // Wait for restore to take effect
      await wait(500);

      // Verify restore
      const restoredConfig = await promisifyApiCall(callback => configApi.getConfig(callback));
      expect(restoredConfig.id.name).toBe(originalConfig.id.name);
      console.log('Restored device name:', restoredConfig.id.name);

      // Final verification that we're back to original
      expect(restoredConfig.id.name).not.toBe(newName);
      console.log('Final verification - Original name:', originalConfig.id.name);
      console.log('Final verification - Current name:', restoredConfig.id.name);
    }, 30000); // 30 second timeout
  });
}); 