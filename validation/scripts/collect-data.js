#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const DEVICE_IP = process.argv[2] || '10.0.0.100';
const OUTPUT_DIR = path.join(__dirname, '../captured-data/esp32-ethernet');
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // milliseconds

// WLED JSON API endpoints
const endpoints = [
  { path: '/json', name: 'complete-api', description: 'Complete API response' },
  { path: '/json/state', name: 'state', description: 'Current device state' },
  { path: '/json/info', name: 'info', description: 'Device information' },
  { path: '/json/cfg', name: 'config', description: 'Complete configuration' },
  { path: '/json/eff', name: 'effects', description: 'Effects list' },
  { path: '/json/pal', name: 'palettes', description: 'Palettes list' },
  { path: '/json/palx?page=0', name: 'palettes-page0', description: 'Palettes page 0' },
  { path: '/json/palx?page=1', name: 'palettes-page1', description: 'Palettes page 1' },
  { path: '/json/fxda', name: 'effect-data', description: 'Effect metadata' },
  { path: '/json/nodes', name: 'nodes', description: 'Network nodes discovery' },
  { path: '/json/net', name: 'networks', description: 'Network information' },
  { path: '/json/si', name: 'state-info', description: 'Combined state+info' },
  { path: '/json/live', name: 'live', description: 'Live data stream info' }
];

// HTTP GET with promise
function httpGet(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { timeout }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        });
      });
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Fetch endpoint data with retry logic
async function fetchEndpointData(endpoint) {
  const url = `http://${DEVICE_IP}${endpoint.path}`;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📡 Fetching ${endpoint.name}: ${url} (attempt ${attempt}/${MAX_RETRIES})`);
      
      const response = await httpGet(url);
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}`);
      }
      
      // Parse and validate JSON
      const data = JSON.parse(response.body);
      
      const result = {
        endpoint: endpoint,
        timestamp: new Date().toISOString(),
        httpStatus: response.statusCode,
        contentType: response.headers['content-type'],
        dataSize: response.body.length,
        data: data
      };
      
      console.log(`💾 Saved ${endpoint.name} (${result.dataSize} bytes) -> ${endpoint.name}.json`);
      return result;
      
    } catch (error) {
      console.log(`❌ Failed to fetch ${endpoint.name} (attempt ${attempt}): ${error.message}`);
      
      // Wait before retry (except on last attempt)
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Waiting ${RETRY_DELAY/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  
  console.log(`💀 Giving up on ${endpoint.name} after ${MAX_RETRIES} attempts`);
  return {
    endpoint: endpoint,
    timestamp: new Date().toISOString(),
    error: `Failed after ${MAX_RETRIES} attempts`,
    data: null
  };
}

// Main collection function
async function main() {
  console.log(`🚀 Starting WLED API data collection from ${DEVICE_IP}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Test connectivity
  try {
    console.log(`🔗 Testing connectivity to ${DEVICE_IP}...`);
    const testResponse = await httpGet(`http://${DEVICE_IP}/json/info`, 3000);
    if (testResponse.statusCode !== 200) {
      throw new Error(`Device not reachable: HTTP ${testResponse.statusCode}`);
    }
    console.log(`✅ Device is reachable`);
  } catch (error) {
    console.error(`❌ Cannot reach device at ${DEVICE_IP}: ${error.message}`);
    console.error(`   Make sure the device is powered on and accessible on the network`);
    process.exit(1);
  }
  
  const results = [];
  const deviceInfo = {
    ip: DEVICE_IP,
    collectionStart: new Date().toISOString(),
    endpoints: {}
  };
  
  // Collect data from all endpoints
  for (const endpoint of endpoints) {
    const result = await fetchEndpointData(endpoint);
    results.push(result);
    
    if (result.data) {
      // Save individual endpoint data
      const filename = `${endpoint.name}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      const output = {
        meta: {
          endpoint: endpoint,
          timestamp: result.timestamp,
          httpStatus: result.httpStatus,
          contentType: result.contentType,
          dataSize: result.dataSize
        },
        data: result.data
      };
      
      fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
      
      deviceInfo.endpoints[endpoint.name] = {
        success: true,
        dataSize: result.dataSize,
        filename: filename
      };
    } else {
      deviceInfo.endpoints[endpoint.name] = {
        success: false,
        error: result.error
      };
    }
    
    // Small delay between endpoints
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Save collection summary
  deviceInfo.collectionEnd = new Date().toISOString();
  const summaryPath = path.join(OUTPUT_DIR, 'collection-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(deviceInfo, null, 2));
  
  // Print summary
  const successful = results.filter(r => r.data).length;
  const failed = results.filter(r => !r.data).length;
  
  console.log('\n📊 Collection Summary:');
  console.log(`   Device: ${DEVICE_IP}`);
  console.log(`   Total endpoints: ${endpoints.length}`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed endpoints:');
    results.filter(r => !r.data).forEach(f => {
      console.log(`   - ${f.endpoint.name}: ${f.error}`);
    });
  }
  
  console.log('\n✅ Data collection complete!');
}

// Handle command line usage
if (require.main === module) {
  if (process.argv.includes('--help')) {
    console.log('Usage: node collect-data.js [IP_ADDRESS]');
    console.log('Example: node collect-data.js 10.0.0.100');
    process.exit(0);
  }
  
  main().catch(error => {
    console.error('💥 Collection failed:', error);
    process.exit(1);
  });
} 