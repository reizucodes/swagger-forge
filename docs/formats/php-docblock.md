# PHP DocBlock

## What It Is

PHPDoc-style `@OA\*` annotations parsed by [swagger-php](https://github.com/zircote/swagger-php) and its Laravel wrapper [l5-swagger](https://github.com/DarkaOnLine/L5-Swagger). The annotations live inside a `/** */` docblock placed directly above a controller method. swagger-php scans your source tree and assembles an OpenAPI spec from all discovered annotations.

## Installation

**Laravel (l5-swagger)**

```bash
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

**Framework-agnostic**

```bash
composer require zircote/swagger-php
```

## Where to Place the Output

Paste the generated block immediately above the controller method that handles the route:

```php
/**
 *     @OA\Get(
 *         path="/pet/{petId}",
 *         ...
 *     )
 */
public function show(int $petId): JsonResponse
{
    // ...
}
```

The docblock must be part of a class that swagger-php scans. Register the scan path in `config/l5-swagger.php` under `annotations`.

## Annotation Reference

### Method annotation

The outermost annotation reflects the HTTP method: `@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`, or `@OA\Delete`.

| Attribute | Source field | Notes |
|---|---|---|
| `path` | Endpoint path | Always present |
| `security` | Security type | See security section below |
| `operationId` | Operation ID | Omitted when blank |
| `tags` | Tags | Single tag wrapped in `{}` array syntax |
| `summary` | Summary | Omitted when blank |
| `description` | Description | Omitted when blank |

### `@OA\Parameter`

Emitted once per parameter entry. Parameters can be located in `path`, `query`, or `header`.

| Attribute | Notes |
|---|---|
| `name` | Parameter name |
| `in` | `path`, `query`, or `header` |
| `description` | Omitted when blank |
| `required` | `true` or `false` |
| `@OA\Schema(type="...")` | Omitted when no schema type is set |

### `@OA\RequestBody`

Emitted for non-GET methods when at least one request body field is defined. Always includes `required=true`.

**`application/json` content type**

```
@OA\RequestBody(
    required=true,
    @OA\JsonContent(
        @OA\Property(...),
    ),
),
```

**`multipart/form-data` content type**

```
@OA\RequestBody(
    required=true,
    @OA\MediaType(
        mediaType="multipart/form-data",
        @OA\Schema(
            @OA\Property(...),
        ),
    ),
),
```

`application/x-www-form-urlencoded` falls back to the `@OA\JsonContent` path (see source comment — full support is a planned addition).

### `@OA\Property`

Each JSON field in the request body or response schema is rendered as an `@OA\Property`. Fields are rendered recursively.

| Attribute | Notes |
|---|---|
| `property` | Field name |
| `format="binary"` | Only for `file` schema type |
| `type` | Schema type. `file` fields render as `type="string"`. Primitive arrays render as `type="string"` with an inline example |
| `description` | Omitted when blank |
| `example` | Omitted for `object` and `file` types. Primitive array examples use PHP annotation array syntax: `example={1,2,3}` or `example={"a","b"}` |

### Nested fields

- **`object`** children are rendered as additional `@OA\Property` entries at the next indentation level inside the parent property.
- **`array`** children are wrapped in `@OA\Items(...)` inside the parent property.

### `@OA\Response`

Emitted once per response definition. If no responses are defined, a default `@OA\Response(response=200, description="Success")` is emitted.

When a response includes a schema, the response block expands:

```
@OA\Response(
    response=200,
    description="...",
    @OA\JsonContent(
        @OA\Property(...),
    ),
),
```

When no schema is defined, the compact single-line form is used.

### Security

| Security type | Annotation emitted |
|---|---|
| `sanctum` | `security={{"sanctum": {}}}` |
| `bearer` | `security={{"bearerAuth": {}}}` |
| `apiKey` | `security={{"apiKeyAuth": {}}}` |
| `jwt` | `security={{"jwt": {}}}` |

#### Why double braces

OpenAPI security requirements are an array of objects: `[{"schemeName": []}]`. PHP annotation syntax represents arrays with `{}`. An outer `{}` wraps the array, and the inner `{}` is the empty scope array for the named scheme. The result is `security={{"sanctum": {}}}`.

## Complete Example

**GET /pet/{petId}** — fetch a pet by ID, bearer auth, path parameter, and a response schema.

```php
/**
 *     @OA\Get(
 *         path="/pet/{petId}",
 *         security={{"bearerAuth": {}}},
 *         operationId="getPetById",
 *         tags={"Pets"},
 *         summary="Find pet by ID",
 *         description="Returns a single pet",
 *         @OA\Parameter(
 *             name="petId",
 *             in="path",
 *             required=true,
 *             @OA\Schema(type="integer"),
 *         ),
 *         @OA\Response(
 *             response=200,
 *             description="Successful operation",
 *             @OA\JsonContent(
 *                 @OA\Property(
 *                     property="id",
 *                     type="integer",
 *                     example="1",
 *                 ),
 *                 @OA\Property(
 *                     property="name",
 *                     type="string",
 *                     example="doggie",
 *                 ),
 *                 @OA\Property(
 *                     property="status",
 *                     type="string",
 *                     example="available",
 *                 ),
 *             ),
 *         ),
 *         @OA\Response(response=404, description="Pet not found")
 *     )
 */
public function show(int $petId): JsonResponse
```

## Common Gotchas

**Missing `@OA\Info` block.** swagger-php requires exactly one `@OA\Info` annotation in the scanned path. apispec-forge does not generate this block. Add it manually, typically in a dedicated `OpenApiInfo.php` file or on your base controller:

```php
/**
 * @OA\Info(title="Pet Store API", version="1.0.0")
 */
```

**Scan path not registered.** l5-swagger will not find your annotations unless the directory containing your controllers (or the file with `@OA\Info`) is listed under `annotations` in `config/l5-swagger.php`.

**Trailing commas.** The generator removes the trailing comma from the last attribute in the outermost annotation to comply with swagger-php's parser. Inner nested annotations retain their trailing commas; this is valid annotation syntax.
