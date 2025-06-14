const fs = require('fs');
const path = require('path');

// Import the functions we want to test
const { sanitizeObject, sanitizeString, sanitizeFile } = require('../../../validation/scripts/sanitize-data');

describe('sanitize-data.js', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('sanitizeString', () => {
    test('should sanitize MAC addresses', () => {
      const input = 'Device MAC: 12:34:56:78:9A:BC';
      const expected = 'Device MAC: AA:BB:CC:DD:EE:FF';
      expect(sanitizeString(input)).toBe(expected);
    });

    test('should sanitize IP addresses', () => {
      const input = 'Device IP: 10.0.0.1';
      const expected = 'Device IP: 192.168.1.100';
      expect(sanitizeString(input)).toBe(expected);
    });

    test('should sanitize SSIDs', () => {
      const input = 'MyHomeNetwork';
      const expected = 'WLED-Device';
      expect(sanitizeString(input, 'networks')).toBe(expected);
    });

    test('should not sanitize placeholder SSIDs', () => {
      const input = 'WLED-Device';
      expect(sanitizeString(input, 'networks')).toBe(input);
    });
  });

  describe('sanitizeObject', () => {
    test('should sanitize sensitive fields in objects', () => {
      const input = {
        ssid: 'MyHomeNetwork',
        password: 'secret123',
        ip: '10.0.0.1',
        mac: '12:34:56:78:9A:BC'
      };
      const expected = {
        ssid: 'WLED-Device',
        password: '***',
        ip: '192.168.1.100',
        mac: 'AA:BB:CC:DD:EE:FF'
      };
      expect(sanitizeObject(input)).toEqual(expected);
    });

    test('should handle nested objects', () => {
      const input = {
        wifi: {
          ssid: 'MyHomeNetwork',
          bssid: '12:34:56:78:9A:BC',
          ip: '10.0.0.1'
        }
      };
      const expected = {
        wifi: {
          ssid: 'WLED-Device',
          bssid: 'AA:BB:CC:DD:EE:FF',
          ip: '192.168.1.100'
        }
      };
      expect(sanitizeObject(input)).toEqual(expected);
    });

    test('should handle arrays', () => {
      const input = {
        networks: [
          { ssid: 'Network1', password: 'pass1' },
          { ssid: 'Network2', password: 'pass2' }
        ]
      };
      const expected = {
        networks: [
          { ssid: 'WLED-Device', password: '***' },
          { ssid: 'WLED-Device', password: '***' }
        ]
      };
      expect(sanitizeObject(input)).toEqual(expected);
    });

    test('should handle null and undefined values', () => {
      const input = {
        ssid: null,
        password: undefined,
        ip: '10.0.0.1'
      };
      const expected = {
        ssid: null,
        password: undefined,
        ip: '192.168.1.100'
      };
      expect(sanitizeObject(input)).toEqual(expected);
    });
  });

  describe('sanitizeFile', () => {
    test('should process a file correctly', () => {
      // Mock file system operations
      const rawData = JSON.stringify({
        wifi: {
          ssid: 'MyHomeNetwork',
          password: 'secret123'
        }
      });
      
      fs.readFileSync.mockReturnValue(rawData);
      
      const inputPath = 'input.json';
      const outputPath = 'output.json';
      
      const result = sanitizeFile(inputPath, outputPath);
      
      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        outputPath,
        expect.stringContaining('"ssid": "WLED-Device"')
      );
    });

    test('should handle JSON parse errors', () => {
      fs.readFileSync.mockReturnValue('invalid json');
      
      const result = sanitizeFile('input.json', 'output.json');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 