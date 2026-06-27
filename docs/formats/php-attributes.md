# PHP Attributes

## What It Is

Native PHP 8.0+ attributes parsed by [swagger-php](https://github.com/zircote/swagger-php) v4+. The output uses `#[OA\Method()]` syntax placed directly above a controller method — no docblock required.

## Difference from DocBlock

| Aspect | DocBlock | Attributes |
|---|---|---|
| Wrapper | `/** ... */` | None — bare `#[...]` |
| Method annotation | `@OA\Get(...)` | `#[OA\Get(...)]` |
| Argument separator | `=` | `:` (named arguments) |
| Nested annotations | Inline `@OA\Thing(...)` | `new OA\Thing(...)` |
| Arrays | `{"a", "b"}` | `['a', 'b']` |
| Strings | `"value"` (double-quoted) | `'value'` (single-quoted) |

## Installation

swagger-php v4 or later is required. v3 does not support native PHP attributes.

```bash
composer require zircote/swagger-php
```

For Laravel:

```bash
composer require darkaonline/l5-swagger
```

Verify the installed version: `composer show zircote/swagger-php | grep versions`

## Where to Place the Output

Paste directly above the controller method, outside any docblock:

```php
#[OA\Get(
    path: '/pet/{petId}',
    ...
)]
public function show(int $petId): JsonResponse
{
    // ...
}
```

Multiple attributes can stack above a single method. The scan path configuration is the same as for DocBlock — register the directory in your swagger config.

## Annotation Reference

### Method attribute

`#[OA\Get(...)]`, `#[OA\Post(...)]`, `#[OA\Put(...)]`, `#[OA\Patch(...)]`, `#[OA\Delete(...)]`

| Named argument | Source field | Notes |
|---|---|---|
| `path:` | Endpoint path | Always present, single-quoted |
| `operationId:` | Operation ID | Omitted when blank |
| `summary:` | Summary | Omitted when blank |
| `description:` | Description | Omitted when blank |
| `tags:` | Tags | Single-element array: `['Pets']` |
| `security:` | Security type | See security section below |

### `parameters: [...]`

Emitted as a named `parameters:` array of `new OA\Parameter(...)` values.

| Named argument | Notes |
|---|---|
| `name:` | Parameter name |
| `in:` | `'path'`, `'query'`, or `'header'` |
| `required:` | `true` or `false` |
| `description:` | Omitted when blank |
| `schema:` | `new OA\Schema(type: '...')` — omitted when no schema type is set |

### `requestBody:`

Emitted for non-GET methods when at least one request body field is defined.

**`application/json` (and fallback)**

```php
requestBody: new OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
        properties: [
            new OA\Property(...),
        ],
    ),
),
```

**`multipart/form-data`**

```php
requestBody: new OA\RequestBody(
    required: true,
    content: new OA\MediaType(
        mediaType: 'multipart/form-data',
        schema: new OA\Schema(
            properties: [
                new OA\Property(...),
            ],
        ),
    ),
),
```

### `new OA\Property(...)`

Each JSON field in the request body or response schema is rendered as `new OA\Property(...)`. Fields are rendered recursively.

| Named argument | Notes |
|---|---|
| `property:` | Field name |
| `type:` | Schema type. `file` renders as `'string'`. Primitive arrays render as `'string'` |
| `format:` | `'binary'` — only for `file` schema type |
| `description:` | Omitted when blank |
| `example:` | Omitted for `object` and `file` types. Primitive array examples use PHP array syntax: `[1, 2, 3]` or `['a', 'b']` |

### Nested fields

- **`object`** children are rendered in a `properties: [...]` array inside the parent `OA\Property`.
- **`array`** children are wrapped in `items: new OA\Items(properties: [...])` inside the parent `OA\Property`.

### `responses: [...]`

Always present. Falls back to `new OA\Response(response: 200, description: 'Success')` when no responses are defined.

When a response includes a schema:

```php
new OA\Response(
    response: 200,
    description: 'Successful operation',
    content: new OA\JsonContent(
        properties: [
            new OA\Property(...),
        ],
    ),
),
```

When no schema is defined, the compact single-line form is used:

```php
new OA\Response(response: 200, description: 'Success'),
```

### Security

| Security type | Argument emitted |
|---|---|
| `sanctum` | `security: [['sanctum' => []]]` |
| `bearer` | `security: [['bearerAuth' => []]]` |
| `jwt` | `security: [['jwtAuth' => []]]` |
| `apiKey` | `security: [['apiKeyAuth' => []]]` |

The value is a PHP array of associative arrays matching the OpenAPI security requirement object structure.

## Complete Example

**GET /pet/{petId}** — same scenario as the DocBlock example, in attribute syntax.

```php
#[OA\Get(
    path: '/pet/{petId}',
    operationId: 'getPetById',
    summary: 'Find pet by ID',
    description: 'Returns a single pet',
    tags: ['Pets'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(
            name: 'petId',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer'),
        ),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successful operation',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: 'id',
                        type: 'integer',
                        example: '1',
                    ),
                    new OA\Property(
                        property: 'name',
                        type: 'string',
                        example: 'doggie',
                    ),
                    new OA\Property(
                        property: 'status',
                        type: 'string',
                        example: 'available',
                    ),
                ],
            ),
        ),
        new OA\Response(response: 404, description: 'Pet not found'),
    ]
)]
public function show(int $petId): JsonResponse
```

## Common Gotchas

**Requires PHP 8.0+.** Native attributes are a PHP 8 language feature. Projects running PHP 7.x must use the DocBlock format.

**swagger-php v3 does not support attributes.** If `composer show zircote/swagger-php` reports a v3.x version, attributes will be silently ignored. Upgrade to v4: `composer require zircote/swagger-php:^4`.

**Trailing comma removal.** The generator strips the trailing comma from the last named argument in the outermost `#[OA\Method(` to produce valid PHP syntax. Inner `new OA\*()` calls retain trailing commas; PHP 8.0+ allows trailing commas in named argument lists.

**`@OA\Info` still required.** The same requirement applies as with DocBlock — swagger-php needs exactly one `OA\Info` attribute (or docblock) somewhere in the scanned path. apispec-forge does not generate it.
