# OpenAPI JSON

## What It Is

A native [OpenAPI 3.0](https://swagger.io/specification/) JSON document. The output is a valid partial OpenAPI spec covering a single endpoint. It can be loaded directly into Swagger UI, Postman, or Redoc, and fed into code generators such as [openapi-generator](https://openapi-generator.tech/).

## What Reads It

- **Swagger UI** — serve the file statically or paste into the editor at [editor.swagger.io](https://editor.swagger.io)
- **Postman** — import via File > Import > OpenAPI
- **Redoc** — point `spec-url` at the file
- **openapi-generator** — `openapi-generator-cli generate -i spec.json -g <target>`
- Any tool that accepts an OpenAPI 3.0 document

## Document Structure

The generator produces a JSON object with the following top-level keys:

```
openapi        — always "3.0.0"
components     — present only when a security scheme is selected
  securitySchemes
paths          — contains the single endpoint definition
```

The `info` key is intentionally omitted. A complete, valid OpenAPI spec requires an `info` object. Add it manually before using the output as a full spec:

```json
"info": {
  "title": "Pet Store API",
  "version": "1.0.0"
}
```

## Field Reference

### `paths[path][method]`

| Field | Source | Notes |
|---|---|---|
| `summary` | Summary | Present when non-empty |
| `description` | Description | Present when non-empty |
| `operationId` | Operation ID | Present when non-empty |
| `tags` | Tags | Single-element array when set |
| `security` | Security type | See security section |
| `parameters` | Parameters array | Present when parameters are defined |
| `requestBody` | Request body fields | Present for non-GET when fields exist |
| `responses` | Responses | Always present |

### `parameters`

Each entry follows the standard OpenAPI parameter object:

```json
{
  "name": "petId",
  "in": "path",
  "required": true,
  "description": "ID of pet to return",
  "schema": { "type": "integer" }
}
```

`in` reflects the parameter location: `path`, `query`, or `header`.

### `requestBody`

Always has `required: true`. The content key is set to the selected content type (`application/json`, `multipart/form-data`, or `application/x-www-form-urlencoded`). The schema is built from the request body JSON fields via `jsonFieldsToSchema`.

### `responses`

Keys are HTTP status code strings. Each value has a `description`. When a response schema is defined, a `content` key is added with `application/json` and the schema built from the response JSON fields.

### `jsonFieldsToSchema` — field mapping

The `jsonFieldsToSchema` function converts a `JsonField[]` array to an OpenAPI schema object. It always produces a top-level `type: "object"` with a `properties` map.

| `JsonField` property | Maps to |
|---|---|
| `schemaType` | `type` |
| `description` | `description` (omitted when blank) |
| `example` | `example` (omitted when blank) |
| `required: true` | Name added to top-level `required` array |
| `children` (object) | `properties` key containing a nested schema from `jsonFieldsToSchema(children)` |
| `children` (array) | `items: { type: "object", properties: ... }` from `jsonFieldsToSchema(children)` |

### Security

Security schemes are written to `components.securitySchemes`. The security requirement is added to the operation.

| Security type | Scheme name | Scheme definition |
|---|---|---|
| `sanctum` | `bearerAuth` | `{ type: "http", scheme: "bearer" }` |
| `bearer` | `bearerAuth` | `{ type: "http", scheme: "bearer" }` |
| `jwt` | `jwtAuth` | `{ type: "http", scheme: "bearer", bearerFormat: "JWT" }` |
| `apiKey` | `apiKeyAuth` | `{ type: "apiKey", in: "header", name: "<headerName or X-API-Key>" }` |

Both `sanctum` and `bearer` produce the same `bearerAuth` scheme.

## Complete Example

**GET /pet/{petId}** — path parameter, bearer auth, 200 response with schema, 404 without.

```json
{
  "openapi": "3.0.0",
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer"
      }
    }
  },
  "paths": {
    "/pet/{petId}": {
      "get": {
        "summary": "Find pet by ID",
        "description": "Returns a single pet",
        "operationId": "getPetById",
        "tags": ["Pets"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          {
            "name": "petId",
            "in": "path",
            "required": true,
            "description": "ID of pet to return",
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "integer", "example": 1 },
                    "name": { "type": "string", "example": "doggie" },
                    "status": { "type": "string", "example": "available" }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Pet not found"
          }
        }
      }
    }
  }
}
```

## Merging Multiple Endpoints

The generator produces a single-path document. To build a complete multi-endpoint spec:

1. Generate each endpoint separately.
2. Merge the `paths` objects manually or with a tool such as [swagger-merger](https://www.npmjs.com/package/swagger-merger).
3. Add a single top-level `info` object.
4. Deduplicate `components.securitySchemes` if the same scheme appears in multiple files.

Alternatively, use the generated JSON as a starting point and extend it manually.
