import { describe, expect, test } from 'vitest'
import { PyFastApiGenerator } from './pyFastApiGenerator'
import { getSpecVersion } from '@/core/annotation/specs'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'

const generator = new PyFastApiGenerator()
const openapi3 = getSpecVersion('openapi-3.0.3')

function makeEndpoint(overrides: Partial<Endpoint>): Endpoint {
    return {
        method: 'get',
        path: '/items',
        ...overrides,
    }
}

describe('PyFastApiGenerator', () => {

    // 1. No body → decorator only
    test('no body emits decorator only (no model, no async def)', () => {
        const endpoint = makeEndpoint({ method: 'get', path: '/users' })
        const result = generator.generate(endpoint, openapi3)
        expect(result).toBe('@router.get("/users")')
        expect(result).not.toContain('class ')
        expect(result).not.toContain('async def')
    })

    // 2. GET with body → decorator only (model suppressed)
    test('GET with body fields emits decorator only — no model', () => {
        const endpoint = makeEndpoint({
            method: 'get',
            path: '/search',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [{ property: 'q', schemaType: 'string', required: true }],
        })
        const result = generator.generate(endpoint, openapi3)
        expect(result).not.toContain('class ')
        expect(result).not.toContain('BaseModel')
        expect(result).not.toContain('async def')
        expect(result).toContain('@router.get')
    })

    // 3. Required field → `name: type`
    test('required body field has no default', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/orders',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [
                { property: 'product_id', schemaType: 'integer', required: true },
            ],
        })
        const result = generator.generate(endpoint, openapi3)
        expect(result).toContain('    product_id: int')
        expect(result).not.toContain('product_id: int | None')
    })

    // 4. Optional field → `name: type | None = None`
    test('optional body field has | None = None', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/orders',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [
                { property: 'notes', schemaType: 'string', required: false },
            ],
        })
        expect(generator.generate(endpoint, openapi3)).toContain('    notes: str | None = None')
    })

    // 5. Form data content type → no model
    test('multipart/form-data skips model generation', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/upload',
            requestBodyContentType: 'multipart/form-data',
            requestBodyJsonFields: [{ property: 'file', schemaType: 'file', required: true }],
        })
        const result = generator.generate(endpoint, openapi3)
        expect(result).not.toContain('class ')
        expect(result).not.toContain('BaseModel')
        expect(result).not.toContain('async def')
    })

    test('application/x-www-form-urlencoded skips model generation', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/login',
            requestBodyContentType: 'application/x-www-form-urlencoded',
            requestBodyJsonFields: [{ property: 'username', schemaType: 'string', required: true }],
        })
        const result = generator.generate(endpoint, openapi3)
        expect(result).not.toContain('class ')
        expect(result).not.toContain('BaseModel')
    })

    // 6. Model name from operationId (PascalCase + Request)
    test('model name derived from operationId (PascalCase + Request)', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/orders',
            operationId: 'createOrder',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [{ property: 'name', schemaType: 'string', required: true }],
        })
        expect(generator.generate(endpoint, openapi3)).toContain('class CreateOrderRequest(BaseModel):')
    })

    test('model name from snake_case operationId', () => {
        const endpoint = makeEndpoint({
            method: 'put',
            path: '/files',
            operationId: 'upload_file',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [{ property: 'name', schemaType: 'string', required: true }],
        })
        expect(generator.generate(endpoint, openapi3)).toContain('class UploadFileRequest(BaseModel):')
    })

    // 7. Model name from method+path when no operationId
    test('model name falls back to method+path when no operationId', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/users/{id}/orders',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [{ property: 'name', schemaType: 'string', required: true }],
        })
        expect(generator.generate(endpoint, openapi3)).toContain('class PostUsersOrdersRequest(BaseModel):')
    })

    // 8. Type mappings: file→bytes, array→list, integer→int, boolean→bool
    test('field schemaType mapping: file→bytes, array→list, object→dict, boolean→bool, number→float, integer→int', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/typed',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [
                { property: 'avatar', schemaType: 'file',    required: true },
                { property: 'tags',   schemaType: 'array',   required: true },
                { property: 'meta',   schemaType: 'object',  required: true },
                { property: 'active', schemaType: 'boolean', required: true },
                { property: 'score',  schemaType: 'number',  required: true },
                { property: 'count',  schemaType: 'integer', required: true },
            ],
        })
        const result = generator.generate(endpoint, openapi3)
        expect(result).toContain('    avatar: bytes')
        expect(result).toContain('    tags: list')
        expect(result).toContain('    meta: dict')
        expect(result).toContain('    active: bool')
        expect(result).toContain('    score: float')
        expect(result).toContain('    count: int')
    })

    test('undefined schemaType maps to str', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/items',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [{ property: 'label', schemaType: undefined, required: true }],
        })
        expect(generator.generate(endpoint, openapi3)).toContain('    label: str')
    })

    // 9. Blank line between model and decorator
    test('blank line separates model from decorator', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/orders',
            operationId: 'createOrder',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [
                { property: 'product_id', schemaType: 'integer', required: true },
                { property: 'notes',      schemaType: 'string',  required: false },
            ],
        })
        const result = generator.generate(endpoint, openapi3)
        // model block ends, blank line, then decorator
        expect(result).toContain('    notes: str | None = None\n\n@router.post')
    })

    // 10. Decorator metadata: summary, tags, responses still correct
    test('decorator metadata: summary, tags, and responses are rendered correctly', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/users/{id}/orders',
            summary: 'Create order',
            tags: 'orders',
            responses: [{ id: 'r1', code: '201', description: 'Created' }],
        })
        const result = generator.generate(endpoint, openapi3)
        expect(result).toContain('summary="Create order"')
        expect(result).toContain('tags=["orders"]')
        expect(result).toContain('    responses={')
        expect(result).toContain('        201: {"description": "Created"},')
    })

    test('responses appear in decorator', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/items',
            responses: [
                { id: 'r1', code: '201', description: 'Created' },
                { id: 'r2', code: '422', description: 'Validation error' },
            ],
        })
        const result = generator.generate(endpoint, openapi3)
        expect(result).toContain('    responses={')
        expect(result).toContain('        201: {"description": "Created"},')
        expect(result).toContain('        422: {"description": "Validation error"},')
    })

    test('no responses omits responses= key', () => {
        const endpoint = makeEndpoint({ method: 'get', path: '/ping', summary: 'Health', responses: [] })
        const result = generator.generate(endpoint, openapi3)
        expect(result).not.toContain('responses=')
        expect(result).toContain('summary="Health"')
    })

    test('tags present vs absent', () => {
        expect(generator.generate(makeEndpoint({ method: 'get', path: '/a', tags: 'users' }), openapi3)).toContain('tags=["users"]')
        expect(generator.generate(makeEndpoint({ method: 'get', path: '/b' }), openapi3)).not.toContain('tags=')
    })

    // --- Additional decorator tests ---

    test('path params pass through as-is in decorator path string', () => {
        const endpoint = makeEndpoint({ method: 'get', path: '/orgs/{orgId}/users/{userId}' })
        expect(generator.generate(endpoint, openapi3)).toContain('@router.get("/orgs/{orgId}/users/{userId}")')
    })

    test('auth is not included in output', () => {
        const endpoint = makeEndpoint({ method: 'get', path: '/me', security: { type: 'bearer' } })
        const result = generator.generate(endpoint, openapi3)
        expect(result).not.toContain('Depends')
        expect(result).not.toContain('Bearer')
    })

    test('no imports or router setup emitted', () => {
        const endpoint = makeEndpoint({ method: 'post', path: '/data', summary: 'Post data' })
        const result = generator.generate(endpoint, openapi3)
        expect(result).not.toContain('import')
        expect(result).not.toContain('APIRouter()')
    })

    test('no async def in any output', () => {
        const endpoints = [
            makeEndpoint({ method: 'get', path: '/users' }),
            makeEndpoint({
                method: 'post',
                path: '/orders',
                requestBodyContentType: 'application/json',
                requestBodyJsonFields: [{ property: 'name', schemaType: 'string', required: true }],
            }),
        ]
        for (const ep of endpoints) {
            expect(generator.generate(ep, openapi3)).not.toContain('async def')
        }
    })

    // --- Full output shape ---

    test('full output shape: model + blank line + decorator only (no async def)', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/users/{id}/orders',
            operationId: 'createOrder',
            summary: 'Create order',
            tags: 'orders',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [
                { property: 'product_id', schemaType: 'integer', required: true },
                { property: 'notes',      schemaType: 'string',  required: false },
            ],
            responses: [{ id: 'r1', code: '201', description: 'Created' }],
        })
        const result = generator.generate(endpoint, openapi3)
        const expected = [
            'class CreateOrderRequest(BaseModel):',
            '    product_id: int',
            '    notes: str | None = None',
            '',
            '@router.post(',
            '    "/users/{id}/orders",',
            '    summary="Create order",',
            '    operation_id="createOrder",',
            '    tags=["orders"],',
            '    responses={',
            '        201: {"description": "Created"},',
            '    },',
            ')',
        ].join('\n')
        expect(result).toBe(expected)
    })

    test('POST with JSON body emits Pydantic model before decorator', () => {
        const endpoint = makeEndpoint({
            method: 'post',
            path: '/orders',
            operationId: 'createOrder',
            requestBodyContentType: 'application/json',
            requestBodyJsonFields: [
                { property: 'name', schemaType: 'string',  required: true },
                { property: 'qty',  schemaType: 'integer', required: true },
                { property: 'note', schemaType: 'string',  required: false },
            ],
        })
        const result = generator.generate(endpoint, openapi3)
        expect(result).toContain('class CreateOrderRequest(BaseModel):')
        expect(result).toContain('    name: str')
        expect(result).toContain('    qty: int')
        expect(result).toContain('    note: str | None = None')
        expect(result.indexOf('class CreateOrderRequest')).toBeLessThan(result.indexOf('@router.post'))
        expect(result).not.toContain('async def')
    })
})
