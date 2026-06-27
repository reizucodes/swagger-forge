# JS JSDoc

## Status

**Work in progress.** The current generator produces a minimal stub containing the path, method, and summary only. Parameters, request body, responses, security, and all other fields are not yet included in the output. The registry marks this target as `isEnabled: false` — it does not appear in the UI by default.

## What It Is

JSDoc `@openapi` blocks consumed by [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc). swagger-jsdoc reads JSDoc comments from your JavaScript or TypeScript source files, extracts blocks tagged with `@openapi`, and assembles an OpenAPI spec from the YAML-formatted content inside those blocks.

## Installation

```bash
npm install swagger-jsdoc
```

## Where to Place the Output

Paste the generated comment directly above a route handler function:

```js
/**
 * @openapi
 * /pet/{petId}:
 *   get:
 *     summary: Find pet by ID
 */
router.get('/pet/:petId', getPetById)
```

swagger-jsdoc locates the block via the `apis` glob in its configuration:

```js
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Pet Store API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.js'],
}
```

## Current Output

Given an endpoint with method `get`, path `/pet/{petId}`, and summary `Find pet by ID`, the generator currently produces:

```js
/**
 * @openapi
 * /pet/{petId}:
 *   get:
 *     summary: Find pet by ID
 */
```

Fields not yet included: `operationId`, `tags`, `description`, `security`, `parameters`, `requestBody`, `responses`.

## What Full JSDoc Output Looks Like

The following is a manually written example showing what complete JSDoc output for this endpoint would look like once the generator is fully implemented. Use this as a reference for filling in the generated stub by hand in the meantime.

```js
/**
 * @openapi
 * /pet/{petId}:
 *   get:
 *     summary: Find pet by ID
 *     description: Returns a single pet
 *     operationId: getPetById
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: petId
 *         in: path
 *         required: true
 *         description: ID of pet to return
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: doggie
 *                 status:
 *                   type: string
 *                   example: available
 *       '404':
 *         description: Pet not found
 */
router.get('/pet/:petId', getPetById)
```

The content inside the `@openapi` block is standard OpenAPI 3.0 YAML. Any valid OpenAPI path item object can be used here.

## Reference

- [swagger-jsdoc documentation](https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md)
- [OpenAPI 3.0 path item specification](https://swagger.io/specification/#path-item-object)
