#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sanitization replacements
const SANITIZATION_RULES = {
  // MAC addresses: xx:xx:xx:xx:xx:xx or xx-xx-xx-xx-xx-xx
  macAddress: {
    pattern: /[0-9a-f]{2}[:-][0-9a-f]{2}[:-][0-9a-f]{2}[:-][0-9a-f]{2}[:-][0-9a-f]{2}[:-][0-9a-f]{2}/gi,
    replacement: 'AA:BB:CC:DD:EE:FF'
  },
  
  // IP addresses: x.x.x.x
  ipAddress: {
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    replacement: '192.168.1.100'
  },
  
  // Email addresses
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: 'user@example.com'
  }
};

// Sensitive field names to sanitize
const SENSITIVE_FIELDS = {
  // Network SSIDs - be more comprehensive
  ssid: 'WLED-Device',
  
  // Passwords
  psk: '***',
  pass: '***',
  pwd: '***',
  password: '***',
  
  // Device names that might contain personal info
  name: 'WLED Device',
  mdns: 'wled-device',
  
  // API keys and tokens
  key: '***',
  token: '***',
  api_key: '***',
  secret: '***',
  
  // User identifiers
  user: 'user',
  username: 'user',
  uid: '12345',
  
  // Location data
  location: 'Home',
  lat: 40.7128,
  lng: -74.0060,
  timezone: 'UTC',
  
  // Custom hostnames
  host: 'wled-device.local',
  hostname: 'wled-device'
};

// Additional patterns to catch
const SENSITIVE_PATTERNS = [
  // WLED device names with MAC-like suffixes (wled-xxxxxx)
  {
    pattern: /^wled-[0-9a-f]{6}$/i,
    replacement: 'wled-device'
  },
  // Any SSID that's not already our placeholder
  {
    pattern: /^(?!WLED-Device$|WLED-AP$).+$/,
    replacement: 'WLED-Device',
    onlyForSSID: true
  }
];

/**
 * Recursively sanitize an object, replacing sensitive values
 */
export function sanitizeObject(obj, depth = 0, parentKey = '') {
  if (depth > 50) {
    console.warn('⚠️  Max recursion depth reached, stopping sanitization');
    return obj;
  }
  
  if (obj === null || obj === undefined) {
    return obj;  // Return null/undefined as is
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1, parentKey));
  }
  
  if (typeof obj !== 'object') {
    // Sanitize string values for patterns like MAC/IP addresses
    if (typeof obj === 'string') {
      return sanitizeString(obj, parentKey);
    }
    return obj;
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    
    // Check if this field should be sanitized by name
    if (SENSITIVE_FIELDS.hasOwnProperty(lowerKey) && value !== null && value !== undefined) {
      sanitized[key] = SENSITIVE_FIELDS[lowerKey];
    } 
    // Special handling for certain field patterns
    else if ((lowerKey.includes('password') || lowerKey.includes('pass') || lowerKey.includes('pwd')) && value !== null && value !== undefined) {
      sanitized[key] = '***';
    }
    else if (lowerKey === 'bssid' && typeof value === 'string') {
      // Always use MAC address format for BSSID
      sanitized[key] = 'AA:BB:CC:DD:EE:FF';
    }
    else if (lowerKey === 'ssid' && typeof value === 'string') {
      // Special handling for SSIDs - sanitize all except our placeholders
      const ssidPattern = SENSITIVE_PATTERNS.find(p => p.onlyForSSID);
      if (ssidPattern && ssidPattern.pattern.test(value)) {
        sanitized[key] = ssidPattern.replacement;
      } else if (value === 'WLED-Device' || value === 'WLED-AP') {
        sanitized[key] = value; // Keep our placeholders
      } else {
        sanitized[key] = 'WLED-Device';
      }
    }
    else if (lowerKey === 'mdns' && typeof value === 'string') {
      // Special handling for mDNS names - check for WLED device patterns
      let sanitizedValue = value;
      for (const pattern of SENSITIVE_PATTERNS) {
        if (!pattern.onlyForSSID && pattern.pattern.test(value)) {
          sanitizedValue = pattern.replacement;
          break;
        }
      }
      sanitized[key] = sanitizedValue;
    }
    else if (lowerKey.includes('mac') && typeof value === 'string') {
      // Use MAC address pattern for other MAC addresses
      sanitized[key] = 'AA:BB:CC:DD:EE:FF';
    }
    else if ((lowerKey.includes('ip') || lowerKey.includes('gateway') || lowerKey.includes('dns')) && value !== null && value !== undefined) {
      if (typeof value === 'string') {
        sanitized[key] = '192.168.1.100';
      } else if (Array.isArray(value) && value.every(v => typeof v === 'number')) {
        // Handle IP address arrays like [192, 168, 1, 100]
        sanitized[key] = [192, 168, 1, 100];
      } else {
        sanitized[key] = sanitizeObject(value, depth + 1, fullKey);
      }
    }
    // Special handling for networks array
    else if (parentKey.includes('networks') || key === 'networks') {
      sanitized[key] = sanitizeObject(value, depth + 1, 'networks');
    }
    else {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value, depth + 1, fullKey);
    }
  }
  
  return sanitized;
}

/**
 * Sanitize string values using regex patterns
 */
export function sanitizeString(str, context = '') {
  let sanitized = str;
  
  // If we're in a networks context, be more aggressive about sanitizing SSIDs
  if (context.includes('networks') || context.includes('ssid')) {
    // Don't sanitize if it's already our placeholder
    if (str !== 'WLED-Device' && str !== 'WLED-AP') {
      sanitized = 'WLED-Device';
    }
  }
  
  // Apply sensitive patterns
  for (const patternRule of SENSITIVE_PATTERNS) {
    if (!patternRule.onlyForSSID && patternRule.pattern.test(sanitized)) {
      sanitized = patternRule.replacement;
      break;
    }
  }
  
  // Apply regex-based sanitization rules
  for (const rule of Object.values(SANITIZATION_RULES)) {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  }
  
  return sanitized;
}

/**
 * Process a single JSON file
 */
export function sanitizeFile(inputPath, outputPath) {
  try {
    console.log(`📝 Processing: ${path.basename(inputPath)}`);
    
    // Read the file
    const content = fs.readFileSync(inputPath, 'utf8');
    
    // Parse JSON
    let data;
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      console.error(`❌ JSON parse error in ${inputPath}: ${parseError.message}`);
      return false;
    }
    
    // Sanitize the data
    const sanitized = sanitizeObject(data);
    
    // Write sanitized data
    fs.writeFileSync(outputPath, JSON.stringify(sanitized, null, 2));
    
    const originalSize = content.length;
    const sanitizedSize = JSON.stringify(sanitized, null, 2).length;
    console.log(`✅ Sanitized ${path.basename(inputPath)} (${originalSize} → ${sanitizedSize} bytes)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}: ${error.message}`);
    return false;
  }
}

/**
 * Process a directory of captured data
 */
export function sanitizeDirectory(inputDir, outputDir) {
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory does not exist: ${inputDir}`);
    return false;
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const files = fs.readdirSync(inputDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    console.warn(`⚠️  No JSON files found in ${inputDir}`);
    return false;
  }
  
  let processed = 0;
  let successful = 0;
  
  for (const filename of jsonFiles) {
    const inputPath = path.join(inputDir, filename);
    const outputPath = path.join(outputDir, filename);
    
    processed++;
    if (sanitizeFile(inputPath, outputPath)) {
      successful++;
    }
  }
  
  console.log(`\n📊 Sanitization Summary:`);
  console.log(`   Total files: ${processed}`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed: ${processed - successful}`);
  console.log(`   Output: ${outputDir}`);
  
  return successful > 0;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log('Usage: node sanitize-data.js [folder] [options]');
    console.log('');
    console.log('Options:');
    console.log('  --all        Process all folders in captured-data/');
    console.log('  --help       Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node sanitize-data.js esp32-ethernet');
    console.log('  node sanitize-data.js --all');
    process.exit(0);
  }
  
  const baseDir = path.join(__dirname, '../captured-data');
  const sanitizedDir = path.join(__dirname, '../sanitized-data');
  
  if (args.includes('--all')) {
    console.log('🧹 Sanitizing all captured data folders...');
    
    if (!fs.existsSync(baseDir)) {
      console.error(`❌ Captured data directory not found: ${baseDir}`);
      process.exit(1);
    }
    
    const folders = fs.readdirSync(baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (folders.length === 0) {
      console.warn('⚠️  No data folders found to sanitize');
      process.exit(0);
    }
    
    let totalProcessed = 0;
    
    for (const folder of folders) {
      console.log(`\n📁 Processing folder: ${folder}`);
      
      const inputDir = path.join(baseDir, folder);
      const outputDir = path.join(sanitizedDir, folder);
      
      if (sanitizeDirectory(inputDir, outputDir)) {
        totalProcessed++;
      }
    }
    
    console.log(`\n🎉 Processed ${totalProcessed}/${folders.length} folders successfully`);
    
  } else {
    // Process specific folder
    const folder = args[0] || 'esp32-ethernet';
    
    console.log(`🧹 Sanitizing data from folder: ${folder}`);
    
    const inputDir = path.join(baseDir, folder);
    const outputDir = path.join(sanitizedDir, folder);
    
    if (sanitizeDirectory(inputDir, outputDir)) {
      console.log('\n✅ Sanitization complete!');
    } else {
      console.error('\n❌ Sanitization failed!');
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 