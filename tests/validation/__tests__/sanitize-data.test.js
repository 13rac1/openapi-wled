const fs = require('fs');
const path = require('path');

// Import the functions we want to test
const { sanitizeObject, sanitizeString, sanitizeFile, sanitizeDirectory } = require('../../../validation/scripts/sanitize-data');

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

    test('should sanitize email addresses', () => {
      const input = 'Contact: user@example.com';
      const expected = 'Contact: user@example.com';
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

    test('should sanitize WLED device names with MAC suffixes', () => {
      const input = 'wled-123456';
      const expected = 'wled-device';
      expect(sanitizeString(input)).toBe(expected);
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

    test('should handle IP address arrays', () => {
      const input = {
        ip: [192, 168, 1, 1],
        gateway: [192, 168, 1, 254],
        dns: [8, 8, 8, 8]
      };
      const expected = {
        ip: [192, 168, 1, 100],
        gateway: [192, 168, 1, 100],
        dns: [192, 168, 1, 100]
      };
      expect(sanitizeObject(input)).toEqual(expected);
    });

    test('should handle device identification fields', () => {
      const input = {
        name: 'My WLED Device',
        mdns: 'wled-123456',
        host: 'wled-device.local',
        hostname: 'wled-device'
      };
      const expected = {
        name: 'WLED Device',
        mdns: 'wled-device',
        host: 'wled-device.local',
        hostname: 'wled-device'
      };
      expect(sanitizeObject(input)).toEqual(expected);
    });

    test('should handle location data', () => {
      const input = {
        location: 'My House',
        lat: 40.7128,
        lng: -74.0060,
        timezone: 'America/New_York'
      };
      const expected = {
        location: 'Home',
        lat: 40.7128,
        lng: -74.0060,
        timezone: 'UTC'
      };
      expect(sanitizeObject(input)).toEqual(expected);
    });

    test('should handle recursion depth limit', () => {
      // Create a deeply nested object
      let input = {};
      let current = input;
      for (let i = 0; i < 60; i++) {
        current.nested = { ssid: 'Network' + i };
        current = current.nested;
      }

      const result = sanitizeObject(input);
      expect(result.nested).toBeDefined();
      expect(console.warn).toHaveBeenCalledWith('⚠️  Max recursion depth reached, stopping sanitization');
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

    test('should handle file read errors', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      const result = sanitizeFile('input.json', 'output.json');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('sanitizeDirectory', () => {
    test('should process a directory of files', () => {
      // Mock directory structure
      fs.existsSync.mockImplementation((path) => {
        return path === 'input'; // Only input exists, output does not
      });
      fs.readdirSync.mockReturnValue(['file1.json', 'file2.json']);
      fs.readFileSync.mockReturnValue('{"ssid": "MyHomeNetwork"}');
      fs.writeFileSync.mockImplementation(() => {});
      
      const result = sanitizeDirectory('input', 'output');
      
      expect(result).toBe(true);
      expect(fs.mkdirSync).toHaveBeenCalledWith('output', { recursive: true });
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    test('should handle non-existent input directory', () => {
      fs.existsSync.mockReturnValue(false);
      
      const result = sanitizeDirectory('nonexistent', 'output');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    test('should handle file processing errors', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['file1.json']);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });
      
      const result = sanitizeDirectory('input', 'output');
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 