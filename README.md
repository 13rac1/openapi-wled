# WLED JSON API OpenAPI Schema

An OpenAPI 3.0 schema for the WLED JSON API.

Originally created as a 1:1 specification copy of [github.com/paul-fornage/wled-json-api-library](https://github.com/paul-fornage/wled-json-api-library).

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
Validates the definition.

The `.redocly.yaml` controls settings for various
tools including the lint tool and the reference
docs engine.  Open it to find examples and
[read the docs](https://redocly.com/docs/cli/configuration/)
for more information.

