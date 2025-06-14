#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// Configuration
const OPENAPI_ROOT = path.join(__dirname, '../../openapi/openapi.yaml');
const SANITIZED_DATA_DIR = path.join(__dirname, '../sanitized-data/esp32-ethernet');
const VALIDATION_REPORT_DIR = path.join(__dirname, '../reports');

// Initialize Ajv with OpenAPI 3.0 support
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  validateSchema: false,
  allowUnionTypes: true
});
addFormats(ajv);

// Add custom formats for OpenAPI
ajv.addFormat('uint8', {
  type: 'number',
  validate: (x) => Number.isInteger(x) && x >= 0 && x <= 255
});
ajv.addFormat('uint16', {
  type: 'number',
  validate: (x) => Number.isInteger(x) && x >= 0 && x <= 65535
});
ajv.addFormat('uint32', {
  type: 'number',
  validate: (x) => Number.isInteger(x) && x >= 0 && x <= 4294967295
});
ajv.addFormat('uint64', {
  type: 'number',
  validate: (x) => Number.isInteger(x) && x >= 0 && x <= Number.MAX_SAFE_INTEGER
});
ajv.addFormat('int8', {
  type: 'number',
  validate: (x) => Number.isInteger(x) && x >= -128 && x <= 127
});
ajv.addFormat('int16', {
  type: 'number',
  validate: (x) => Number.isInteger(x) && x >= -32768 && x <= 32767
});

// Map endpoint paths to schema paths
const ENDPOINT_SCHEMA_MAP = {
  'complete-api': 'components/schemas/CompleteApiResponse',
  'config': 'components/schemas/ConfigResponse',
  'effect-data': 'components/schemas/EffectDataResponse',
  'effects': 'components/schemas/EffectsResponse',
  'info': 'components/schemas/DeviceInfoResponse',
  'live': 'components/schemas/LiveResponse',
  'networks': 'components/schemas/NetworkListResponse',
  'nodes': 'components/schemas/NodesResponse',
  'palettes-page0': 'components/schemas/PaginatedPalettesResponse',
  'palettes-page1': 'components/schemas/PaginatedPalettesResponse',
  'palettes': 'components/schemas/PalettesResponse',
  'state-info': 'components/schemas/StateInfoResponse',
  'state': 'components/schemas/StateResponse'
};

/**
 * Bundle the OpenAPI schema into a single file
 */
function bundleOpenApiSchema() {
  console.log('📦 Bundling OpenAPI schema...');
  try {
    const bundledPath = path.join(__dirname, '../temp-bundled.yaml');
    execSync(`npx redocly bundle ${OPENAPI_ROOT} -o ${bundledPath}`);
    return bundledPath;
  } catch (error) {
    console.error('❌ Failed to bundle OpenAPI schema:', error.message);
    process.exit(1);
  }
}

/**
 * Load and parse the bundled OpenAPI schema
 */
function loadOpenApiSchema(bundledPath) {
  console.log('📖 Loading OpenAPI schema...');
  try {
    const content = fs.readFileSync(bundledPath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error('❌ Failed to load OpenAPI schema:', error.message);
    process.exit(1);
  }
}

/**
 * Resolve schema references
 */
function resolveSchema(schema, rootSchema) {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  // Handle $ref
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/', '').split('/');
    let resolved = rootSchema;
    for (const key of refPath) {
      resolved = resolved[key];
      if (!resolved) {
        throw new Error(`Cannot resolve reference: ${schema.$ref}`);
      }
    }
    return resolveSchema(resolved, rootSchema);
  }

  // Handle arrays
  if (Array.isArray(schema)) {
    return schema.map(item => resolveSchema(item, rootSchema));
  }

  // Handle objects
  const resolved = {};
  for (const [key, value] of Object.entries(schema)) {
    resolved[key] = resolveSchema(value, rootSchema);
  }
  return resolved;
}

/**
 * Load a sanitized JSON response
 */
function loadSanitizedResponse(filename) {
  const filepath = path.join(SANITIZED_DATA_DIR, filename);
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(content);
    return data.data; // Extract the actual response data
  } catch (error) {
    console.error(`❌ Failed to load ${filename}:`, error.message);
    return null;
  }
}

/**
 * Validate a response against its schema
 */
function validateResponse(response, schema, endpoint) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(response);
    
    return {
      valid,
      errors: validate.errors || [],
      endpoint
    };
  } catch (error) {
    console.error(`❌ Validation error for ${endpoint}:`, error.message);
    return {
      valid: false,
      errors: [{ message: error.message }],
      endpoint
    };
  }
}

/**
 * Generate a validation report
 */
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length
    },
    details: results.map(result => ({
      endpoint: result.endpoint,
      valid: result.valid,
      errors: result.errors.map(error => ({
        path: error.instancePath,
        message: error.message,
        params: error.params
      }))
    }))
  };

  // Create reports directory if it doesn't exist
  if (!fs.existsSync(VALIDATION_REPORT_DIR)) {
    fs.mkdirSync(VALIDATION_REPORT_DIR, { recursive: true });
  }

  // Save report
  const reportPath = path.join(VALIDATION_REPORT_DIR, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Starting schema validation...');
  
  // Bundle and load schema
  const bundledPath = bundleOpenApiSchema();
  const schema = loadOpenApiSchema(bundledPath);
  
  // Get all sanitized response files
  const files = fs.readdirSync(SANITIZED_DATA_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('collection-summary'));
  
  const results = [];
  
  // Validate each response
  for (const file of files) {
    const endpoint = file.replace('.json', '');
    const schemaPath = ENDPOINT_SCHEMA_MAP[endpoint];
    
    if (!schemaPath) {
      console.warn(`⚠️  No schema mapping for ${endpoint}`);
      continue;
    }
    
    console.log(`\n🔍 Validating ${endpoint}...`);
    
    const response = loadSanitizedResponse(file);
    if (!response) continue;
    
    // Get schema from OpenAPI spec
    const schemaRef = schemaPath.split('/').reduce((obj, key) => obj[key], schema);
    if (!schemaRef) {
      console.error(`❌ Schema not found: ${schemaPath}`);
      continue;
    }
    
    // Resolve schema references
    const resolvedSchema = resolveSchema(schemaRef, schema);
    
    const result = validateResponse(response, resolvedSchema, endpoint);
    results.push(result);
    
    if (result.valid) {
      console.log(`✅ ${endpoint} is valid`);
    } else {
      console.log(`❌ ${endpoint} has ${result.errors.length} validation errors:`);
      result.errors.forEach(error => {
        console.log(`   - ${error.instancePath}: ${error.message}`);
      });
    }
  }
  
  // Generate and save report
  const report = generateReport(results);
  
  console.log('\n📊 Validation Summary:');
  console.log(`   Total endpoints: ${report.summary.total}`);
  console.log(`   Valid: ${report.summary.valid}`);
  console.log(`   Invalid: ${report.summary.invalid}`);
  console.log(`\n📝 Full report saved to: ${path.join(VALIDATION_REPORT_DIR, 'validation-report.json')}`);
  
  // Clean up temporary bundled file
  fs.unlinkSync(bundledPath);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  });
}

module.exports = {
  validateResponse,
  resolveSchema,
  generateReport
}; 