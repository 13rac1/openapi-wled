# WLED JSON API OpenAPI Schema

An OpenAPI 3.0 schema for the WLED JSON API.

Originally created as a 1:1 specification copy of [github.com/paul-fornage/wled-json-api-library](https://github.com/paul-fornage/wled-json-api-library), this schema has been verified against the actual WLED implementation in [github.com/wled/WLED](https://github.com/wled/WLED.git).

## AI Usage

This project was created with the Cursor IDE using Claude 3.7, Claude 4.0 and Gemini 2.5.

## Development

### Install

1. Install [Node JS](https://nodejs.org/).
2. Clone this repo and run `npm install` in the repo root.

### Usage

#### `npm start`
Starts the reference docs preview server.

#### `npm run build`
Bundles the definition to the dist folder.

#### `npm test`
Validates the definition against the OpenAPI specification and real device data.

### Testing

The project includes several testing options:

#### Basic Testing
```bash
# Run all tests (lint, schema validation, and validation tests)
npm test

# Run only validation tests
npm run test:validation

# Run validation tests with coverage report
npm run test:validation:coverage
```

#### End-to-End Testing
```bash
# Run E2E tests (generates client, runs tests, cleans up)
WLED_DEVICE_URL=http://10.0.0.100 npm run test:e2e
```

#### Schema Validation
```bash
# Validate schema against OpenAPI spec
npm run validate:schema
```

### Validation

To validate the schema against a real WLED device:

1. Collect data from your device:
   ```bash
   # Collect from default IP (10.0.0.100)
   npm run validate:collect

   # Or specify a device IP
   npm run validate:collect 192.168.1.100
   ```

2. Sanitize the collected data:
   ```bash
   npm run validate:sanitize your-device-name
   ```

3. Run the validation:
   ```bash
   npm test
   ```

### GitHub Pages Deployment

The API documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment process:

1. Builds the OpenAPI schema using `npm run build`
2. Deploys the generated documentation to GitHub Pages
3. The documentation will be available at `https://13rac1.github.io/openapi-wled`

To manually trigger a deployment:
1. Go to the "Actions" tab in your GitHub repository
2. Select "Deploy API Documentation" workflow
3. Click "Run workflow"

The `.redocly.yaml` controls settings for various
tools including the lint tool and the reference
docs engine.  Open it to find examples and
[read the docs](https://redocly.com/docs/cli/configuration/)
for more information.
