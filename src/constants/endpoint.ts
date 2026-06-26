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

export const SAMPLE_ENDPOINTS: { json: Record<string, Endpoint>; formData: Record<string, Endpoint>;} = 
{
    json: {
        POST_ADD_PET: SAMPLE_JSON_ADD_PET_ENDPOINT
    },
    formData: {
        POST_UPLOAD_FILE: SAMPLE_FORMDATA_UPLOAD_ENDPOINT
    }
};

