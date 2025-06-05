# Redocly CLI

## Critical Rules

- **Command syntax and basic usage**
  - The basic command format is:  
    `redocly  [options] `
  - Common commands include `lint`, `build-docs`, `bundle`, and `preview-docs`[1].
  - Can be run via `npx`, installed globally with npm, or used as a Docker container[1].

- **When to use this tool**
  - Use Redocly CLI for managing, validating, bundling, and generating documentation for OpenAPI specifications.
  - Ideal for API governance, enforcing API guidelines, and producing reference documentation throughout the API lifecycle[1].

- **Required parameters and formatting**
  - Most commands require an OpenAPI root file (e.g., `openapi.yaml`).
  - File paths must be valid and accessible from the execution environment.
  - Some commands accept additional options, such as output format or configuration files[1].

- **Expected output handling**
  - Outputs can be formatted as human-readable (e.g., `stylish`), JSON, or Checkstyle for integration with other tools.
  - Documentation builds output a static HTML file (`redoc-static.html` by default)[1].

- **Error handling expectations**
  - Meaningful error messages are provided for invalid OpenAPI files, failed validation, or command misuse.
  - Linting errors include clear messages to help correct API issues[1].

- **Input validation rules**
  - Only valid OpenAPI 2.0, 3.0, or 3.1 documents are accepted.
  - The CLI validates structure, references, and compliance with configured rulesets[1].

- **Common pitfalls to avoid**
  - Incorrect file paths or missing files.
  - Using unsupported OpenAPI versions.
  - Not mounting directories correctly when using Docker.
  - Forgetting to configure or customize rulesets for linting.
  - Overlooking opt-out for telemetry if privacy is a concern (`REDOCLY_TELEMETRY=off`)[1].

## Usage Examples

```
# Basic usage
redocly lint openapi.yaml

# Output
Linting results with errors, warnings, or a success message in a human-readable format.

# Advanced usage
redocly build-docs openapi.yaml --output=custom-docs.html

# Output
Generates static HTML documentation at `custom-docs.html`.

# Bundling multiple OpenAPI files
redocly bundle openapi-root.yaml --output=bundled.yaml

# Output
Creates a single bundled OpenAPI file at `bundled.yaml`.

# Invalid usage
redocly lint missing-file.yaml

# Error
Error: File not found: missing-file.yaml

# Invalid OpenAPI version
redocly lint openapi-old.yaml

# Error
Error: Unsupported OpenAPI version in openapi-old.yaml
```

## Implementation Notes

- **Required dependencies**
  - Node.js (minimum version 14.19.0)
  - npm (minimum version 7.0.0)[1]

- **Environment requirements**
  - Can be run on any platform supporting Node.js and npm.
  - Docker alternative available for containerized environments[1].
  - Environment variables for telemetry and update notifications:  
    - `REDOCLY_TELEMETRY=off` to disable data collection  
    - `REDOCLY_SUPPRESS_UPDATE_NOTICE=true` to suppress update checks[1]

- **Integration points with other tools**
  - Output formats (JSON, Checkstyle) support integration with CI/CD pipelines and code quality tools.
  - Can be used locally, in CI environments, or as part of automated API governance workflows[1].

- **Performance considerations**
  - Designed for speed, even with large OpenAPI documents.
  - Bundling and linting are optimized for efficiency and scalability[1].

[1] https://github.com/redocly/redocly-cli