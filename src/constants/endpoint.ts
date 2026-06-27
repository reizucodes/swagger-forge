import type { Endpoint } from "@/domain/endpoint/models/Endpoint";

export const EMPTY_ENDPOINT: Endpoint = {
    method: 'get',
    path: '',
    operationId: '',
    tags: '',
    summary: '',
    description: '',
    parameters: [],
    requestBodyJsonFields: [],
    requestBodyContentType: 'application/json',
    responses: [{ id: crypto.randomUUID(), code: '200', description: 'Success' }],
    security: { type: 'none' },
};

export const SAMPLE_GET_LIST_PETS: Endpoint = {
    method: 'get',
    path: '/pet/findByStatus',
    operationId: 'findPetsByStatus',
    tags: 'Pet Store',
    summary: 'Find pets by status',
    description: 'Returns pets filtered by status.',
    parameters: [
        { id: crypto.randomUUID(), name: 'status', in: 'query', required: true, schemaType: 'string', description: 'Filter by status: available, pending, sold' },
        { id: crypto.randomUUID(), name: 'limit', in: 'query', required: false, schemaType: 'integer', description: 'Max number of results' },
    ],
    requestBodyContentType: 'application/json',
    requestBodyJsonFields: [],
    responses: [
        { id: crypto.randomUUID(), code: '200', description: 'OK', schema: [
            { id: crypto.randomUUID(), property: 'data', schemaType: 'array', description: 'List of pets', children: [
                { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1001 },
                { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Doggie' },
                { id: crypto.randomUUID(), property: 'status', schemaType: 'string', example: 'available' },
                { id: crypto.randomUUID(), property: 'category', schemaType: 'object', children: [
                    { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1 },
                    { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Dogs' },
                ]},
            ]},
            { id: crypto.randomUUID(), property: 'total', schemaType: 'integer', example: 42 },
        ]},
        { id: crypto.randomUUID(), code: '400', description: 'Bad Request' },
    ],
    security: { type: 'none' },
};

export const SAMPLE_GET_PET_BY_ID: Endpoint = {
    method: 'get',
    path: '/pet/{petId}',
    operationId: 'getPetById',
    tags: 'Pet Store',
    summary: 'Find pet by ID',
    description: 'Returns a single pet.',
    parameters: [
        { id: crypto.randomUUID(), name: 'petId', in: 'path', required: true, schemaType: 'integer', description: 'ID of pet to return' },
    ],
    requestBodyContentType: 'application/json',
    requestBodyJsonFields: [],
    responses: [
        { id: crypto.randomUUID(), code: '200', description: 'OK', schema: [
            { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1001 },
            { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Doggie' },
            { id: crypto.randomUUID(), property: 'status', schemaType: 'string', example: 'available' },
            { id: crypto.randomUUID(), property: 'photoUrls', schemaType: 'array', example: 'https://example.com/photo.jpg' },
            { id: crypto.randomUUID(), property: 'tags', schemaType: 'array', example: 'cute,friendly' },
            { id: crypto.randomUUID(), property: 'category', schemaType: 'object', children: [
                { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1 },
                { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Dogs' },
            ]},
        ]},
        { id: crypto.randomUUID(), code: '404', description: 'Not Found' },
    ],
    security: { type: 'none' },
};

export const SAMPLE_POST_ADD_PET: Endpoint = {
    method: 'post',
    path: '/pet',
    operationId: 'addPet',
    tags: 'Pet Store',
    summary: 'Add a new pet to the store',
    description: 'Creates a new pet entry in the store database.',
    parameters: [],
    requestBodyContentType: 'application/json',
    requestBodyJsonFields: [
        { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Doggie', description: 'Name of the pet', required: true },
        { id: crypto.randomUUID(), property: 'photoUrls', schemaType: 'array', example: 'https://example.com/photo.jpg', description: 'Photo URLs', required: true },
        { id: crypto.randomUUID(), property: 'status', schemaType: 'string', example: 'available', description: 'Pet status in the store' },
        { id: crypto.randomUUID(), property: 'tags', schemaType: 'array', example: 'cute,friendly', description: 'Tags for the pet' },
        {
            id: crypto.randomUUID(),
            property: 'category',
            schemaType: 'object',
            description: 'Pet category',
            children: [
                { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1 },
                { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Dogs' },
            ],
        },
    ],
    responses: [
        { id: crypto.randomUUID(), code: '201', description: 'Created', schema: [
            { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1001 },
            { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Doggie' },
            { id: crypto.randomUUID(), property: 'status', schemaType: 'string', example: 'available' },
        ]},
        { id: crypto.randomUUID(), code: '405', description: 'Method Not Allowed' },
    ],
    security: { type: 'none' },
};

export const SAMPLE_POST_UPLOAD_PET_PHOTO: Endpoint = {
    method: 'post',
    path: '/pet/{petId}/uploadImage',
    operationId: 'uploadFile',
    tags: 'Pet Store',
    summary: 'Upload pet photo',
    description: 'Uploads an image for a pet.',
    parameters: [
        { id: crypto.randomUUID(), name: 'petId', in: 'path', required: true, schemaType: 'integer', description: 'ID of pet to update' },
    ],
    requestBodyContentType: 'multipart/form-data',
    requestBodyJsonFields: [
        { id: crypto.randomUUID(), property: 'additionalMetadata', schemaType: 'string', example: 'Cute photo', description: 'Additional metadata' },
        { id: crypto.randomUUID(), property: 'file', schemaType: 'file', description: 'File to upload' },
    ],
    responses: [
        { id: crypto.randomUUID(), code: '200', description: 'OK', schema: [
            { id: crypto.randomUUID(), property: 'message', schemaType: 'string', example: 'Photo uploaded successfully' },
        ]},
    ],
    security: { type: 'none' },
};

export const SAMPLE_PUT_UPDATE_PET: Endpoint = {
    method: 'put',
    path: '/pet',
    operationId: 'updatePet',
    tags: 'Pet Store',
    summary: 'Update an existing pet',
    description: 'Updates a pet in the store with form data.',
    parameters: [],
    requestBodyContentType: 'application/json',
    requestBodyJsonFields: [
        { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1001, description: 'Pet ID', required: true },
        { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Doggie', description: 'Name of the pet', required: true },
        { id: crypto.randomUUID(), property: 'status', schemaType: 'string', example: 'sold', description: 'Pet status', required: true },
        { id: crypto.randomUUID(), property: 'photoUrls', schemaType: 'array', example: 'https://example.com/photo.jpg', description: 'Photo URLs' },
        {
            id: crypto.randomUUID(),
            property: 'category',
            schemaType: 'object',
            description: 'Pet category',
            children: [
                { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1 },
                { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Dogs' },
            ],
        },
    ],
    responses: [
        { id: crypto.randomUUID(), code: '200', description: 'OK', schema: [
            { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1001 },
            { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Doggie' },
            { id: crypto.randomUUID(), property: 'status', schemaType: 'string', example: 'sold' },
        ]},
        { id: crypto.randomUUID(), code: '400', description: 'Bad Request' },
        { id: crypto.randomUUID(), code: '404', description: 'Not Found' },
    ],
    security: { type: 'none' },
};

export const SAMPLE_PATCH_PET_STATUS: Endpoint = {
    method: 'patch',
    path: '/pet/{petId}',
    operationId: 'updatePetStatus',
    tags: 'Pet Store',
    summary: 'Update pet status',
    description: 'Partially updates a pet — status only.',
    parameters: [
        { id: crypto.randomUUID(), name: 'petId', in: 'path', required: true, schemaType: 'integer', description: 'ID of pet' },
    ],
    requestBodyContentType: 'application/json',
    requestBodyJsonFields: [
        { id: crypto.randomUUID(), property: 'status', schemaType: 'string', example: 'pending', description: 'New status', required: true },
    ],
    responses: [
        { id: crypto.randomUUID(), code: '200', description: 'OK', schema: [
            { id: crypto.randomUUID(), property: 'id', schemaType: 'integer', example: 1001 },
            { id: crypto.randomUUID(), property: 'name', schemaType: 'string', example: 'Doggie' },
            { id: crypto.randomUUID(), property: 'status', schemaType: 'string', example: 'pending' },
        ]},
        { id: crypto.randomUUID(), code: '404', description: 'Not Found' },
    ],
    security: { type: 'none' },
};

export const SAMPLE_DELETE_PET: Endpoint = {
    method: 'delete',
    path: '/pet/{petId}',
    operationId: 'deletePet',
    tags: 'Pet Store',
    summary: 'Delete a pet',
    description: 'Removes a pet from the store.',
    parameters: [
        { id: crypto.randomUUID(), name: 'petId', in: 'path', required: true, schemaType: 'integer', description: 'Pet ID to delete' },
    ],
    requestBodyContentType: 'application/json',
    requestBodyJsonFields: [],
    responses: [
        { id: crypto.randomUUID(), code: '204', description: 'No Content' },
        { id: crypto.randomUUID(), code: '404', description: 'Not Found' },
    ],
    security: { type: 'none' },
};

export const SAMPLE_JSON_ADD_PET_ENDPOINT: Endpoint = {
    method: 'post',
    path: '/pet/add',
    operationId: 'addPet',
    tags: 'Pet Store',
    summary: 'Add a new pet to the store',
    description: 'Creates a new pet entry in the store database.',
    parameters: [],
    requestBodyContentType: 'application/json',
    requestBodyJsonFields: [
        {
            id: crypto.randomUUID(),
            property: 'id',
            schemaType: 'integer',
            example: 1001, description: 'Unique ID for the pet'
        },
        {
            id: crypto.randomUUID(),
            property: 'name',
            schemaType: 'string',
            example: 'Doggie',
            description: 'Name of the pet'
        },
        {
            id: crypto.randomUUID(),
            property: 'photoUrls',
            schemaType: 'array',
            example: 'https://example.com/photo.jpg',
            description: 'Photo URLs'
        },
        {
            id: crypto.randomUUID(),
            property: 'tags',
            schemaType: 'array',
            example: 'cute,friendly',
            description: 'Tags for the pet'
        },
        {
            id: crypto.randomUUID(),
            property: 'status',
            schemaType: 'string',
            example: 'available',
            description: 'Pet status in the store'
        },
        {
            id: crypto.randomUUID(),
            property: 'category',
            schemaType: 'object',
            description: 'Pet category',
            children: [
                {
                    id: crypto.randomUUID(),
                    property: 'id',
                    schemaType: 'number',
                    example: 1,
                },
                {
                    id: crypto.randomUUID(),
                    property: 'name',
                    schemaType: 'string',
                    example: 'Dogs'
                }
            ]
        }
    ],
    responses: [
        { id: crypto.randomUUID(), code: '200', description: 'Success' },
        { id: crypto.randomUUID(), code: '400', description: 'Bad Request' }
    ],
    security: { type: 'none' },
};

export const SAMPLE_FORMDATA_UPLOAD_ENDPOINT: Endpoint = {
    method: "post",
    path: "/upload",
    operationId: 'uploadFile',
    tags: 'File Upload',
    summary: 'Upload file to database',
    description: 'Stores new file',
    requestBodyContentType: "multipart/form-data",
    requestBodyJsonFields: [
        { id: crypto.randomUUID(), property: "userId", schemaType: "integer", example: 10, description: "User ID" },
        { id: crypto.randomUUID(), property: "file", schemaType: "file", description: "Uploaded file" }
    ],
    responses: [{ id: crypto.randomUUID(), code: "200", description: "Uploaded" }],
    security: { type: 'none' }
};

export const SAMPLE_ENDPOINTS: Record<string, { label: string; hint?: string; endpoint: Endpoint }[]> = {
    get: [
        { label: 'Find pets by status', endpoint: SAMPLE_GET_LIST_PETS },
        { label: 'Get pet by ID', endpoint: SAMPLE_GET_PET_BY_ID },
    ],
    post: [
        { label: 'Add pet', hint: 'JSON', endpoint: SAMPLE_POST_ADD_PET },
        { label: 'Upload pet photo', hint: 'multipart', endpoint: SAMPLE_POST_UPLOAD_PET_PHOTO },
    ],
    put: [
        { label: 'Update pet', endpoint: SAMPLE_PUT_UPDATE_PET },
    ],
    patch: [
        { label: 'Update pet status', endpoint: SAMPLE_PATCH_PET_STATUS },
    ],
    delete: [
        { label: 'Delete pet', endpoint: SAMPLE_DELETE_PET },
    ],
};

