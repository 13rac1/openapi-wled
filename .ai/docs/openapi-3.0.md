## Introduction to OpenAPI 3.0 Schema Specification

OpenAPI 3.0 (formerly Swagger) is a widely adopted standard for describing RESTful APIs in a machine-readable and human-friendly way. The OpenAPI Specification (OAS) enables you to define the structure, endpoints, operations, parameters, data models, and responses of your API in a single YAML or JSON document. This document serves as both documentation and a contract for your API, facilitating automation, testing, and client generation[2][3][5].

A central part of OpenAPI is the **Schema Object**, which describes the structure and data types of request and response bodies, parameters, and more. The schema is based on a subset of JSON Schema, allowing you to define objects, arrays, primitives, and validation rules[7].

---

## OpenAPI 3.0 Document Structure

A typical OpenAPI 3.0 document includes:

- **openapi**: The version of the OpenAPI Specification.
- **info**: Metadata about the API (title, version, description).
- **servers**: The base URLs for the API.
- **paths**: The available endpoints and their operations (GET, POST, etc.).
- **components**: Reusable definitions (schemas, parameters, responses, etc.)[3][5].

**Example: Minimal OpenAPI 3.0 YAML**

```yaml
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
  description: A simple API to illustrate OpenAPI concepts
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: A list of users
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
components:
  schemas:
    UserList:
      type: array
      items:
        $ref: '#/components/schemas/User'
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
      required:
        - id
        - name
```


---

## The Schema Object in OpenAPI 3.0

The **Schema Object** is used to describe input and output data types for your API. It supports:

- **type**: Data type (`object`, `array`, `string`, `integer`, etc.)
- **properties**: Fields of an object, each with its own schema.
- **items**: Schema for array elements.
- **required**: List of required properties.
- **format**: Further restricts the data type (e.g., `date-time`, `email`).
- **enum**: Allowed values.
- **description**: Human-readable description.
- **example**: Example value for documentation and testing[7][8].

**Example: Defining a Schema Object**

```yaml
components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: integer
          description: Unique product ID
        name:
          type: string
        price:
          type: number
          format: float
          minimum: 0
      required:
        - id
        - name
        - price
      example:
        id: 123
        name: "Widget"
        price: 19.99
```


---

## Adding Examples

You can add examples at various levels:

- **Property-level example**: Shows a sample value for a field.
- **Object-level example**: Shows a sample object.
- **Parameter/request/response-level examples**: Shows sample values for API requests or responses.

**Example: Parameter with Multiple Examples**

```yaml
parameters:
  - in: query
    name: limit
    schema:
      type: integer
      maximum: 50
    examples:
      zero:
        value: 0
        summary: A sample limit value
      max:
        value: 50
        summary: A sample limit value
```


---

## Tutorial: Creating a Simple OpenAPI 3.0 Schema

**Step 1: Start with the OpenAPI version and API info**

```yaml
openapi: 3.0.0
info:
  title: Bookstore API
  version: 1.0.0
  description: Simple API for managing books
```

**Step 2: Define a path and an operation**

```yaml
paths:
  /books:
    get:
      summary: List all books
      responses:
        '200':
          description: A list of books
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Book'
```

**Step 3: Define the Book schema**

```yaml
components:
  schemas:
    Book:
      type: object
      properties:
        id:
          type: integer
          example: 1
        title:
          type: string
          example: "The Hobbit"
        author:
          type: string
          example: "J.R.R. Tolkien"
      required:
        - id
        - title
        - author
```


---

## Summary

- OpenAPI 3.0 provides a standardized way to describe RESTful APIs.
- The Schema Object allows you to define and validate data models.
- Examples can be added at various levels to improve documentation and testing.
- Use the `components` section to define reusable schemas and keep your specification DRY.

For more detailed information, refer to the official OpenAPI Specification documentation[1][3][5].

[1] https://swagger.io/specification/
[2] https://blog.postman.com/what-is-openapi/
[3] https://swagger.io/docs/specification/v3_0/basic-structure/
[4] https://apisyouwonthate.com/blog/openapi-v3-1-and-json-schema/
[5] https://support.smartbear.com/swaggerhub/docs/en/get-started/openapi-3-0-tutorial.html
[6] https://swagger.io/docs/specification/v3_0/adding-examples/
[7] https://redocly.com/learn/openapi/openapi-visual-reference/schemas
[8] https://philsturgeon.com/openapi-examples/
[9] https://spec.openapis.org/oas/v3.0.3.html
[10] https://swagger.io/docs/specification/v3_0/data-models/data-models/
[11] https://github.com/OAI/OpenAPI-Specification
[12] https://dzone.com/articles/a-sample-openapi-30-file-to-get-started
[13] https://github.com/Redocly/openapi-template/blob/gh-pages/openapi.yaml
[14] https://www.apideck.com/blog/introduction-to-openapi-specification
[15] https://www.youtube.com/watch?v=6kwmW_p_Tig
[16] https://apidog.com/blog/openapi-specification/
[17] https://stackoverflow.com/questions/71121399/how-do-i-incorporate-json-schema-into-my-openapi-file