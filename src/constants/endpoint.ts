import type { Endpoint } from '../types';

export const EMPTY_ENDPOINT: Endpoint = {
    method: 'get',
    path: '',
    operationId: '',
    tags: '',
    summary: '',
    description: '',
    parameters: [
        {
            name: '', 
            in: 'query', 
            required: false, 
            schemaType:'string',
            description: ''
        }
    ],
    requestBodyJsonFields: [
        { 
            property: '', 
            schemaType: 'string', 
            example: "", 
            description: '' }
    ],
    requestBodyContentType: 'application/json',
    responses: [{ code: '200', description: 'Success' }],
    security: { bearer: false },
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
            property: 'id', 
            schemaType: 'integer', 
            example: 1001, description: 'Unique ID for the pet' 
        },
        { 
            property: 'name', 
            schemaType: 'string', 
            example: 'Doggie', 
            description: 'Name of the pet' 
        },
        { 
            property: 'photoUrls', 
            schemaType: 'array', 
            example: 'https://example.com/photo.jpg', 
            description: 'Photo URLs' 
        },
        { 
            property: 'tags', 
            schemaType: 'array', 
            example: 'cute,friendly', 
            description: 'Tags for the pet' 
        },
        { 
            property: 'status', 
            schemaType: 'string', 
            example: 'available', 
            description: 'Pet status in the store' 
        },
        { 
            property: 'category', 
            schemaType: 'object', 
            description: 'Pet category', 
            children: [
                {
                    property: 'id',
                    schemaType: 'number',
                    example: 1,
                },
                {
                    property: 'name',
                    schemaType: 'string',
                    example: 'Dogs'
                }
            ]
        }
    ],
    responses: [
        { code: '200', description: 'Success' },
        { code: '400', description: 'Bad Request' }
    ],
    security: { bearer: false },
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
        { property: "userId", schemaType: "integer", example: 10 , description: "User ID"},
        { property: "file", schemaType: "file", description: "Uploaded file" }
    ],
    responses: [{ code: "200", description: "Uploaded" }],
    security: { bearer: false }
};

export const SAMPLE_ENDPOINTS: {
    json: Record<string, Endpoint>;
    formData: Record<string, Endpoint>;
} = {
    json: {
        POST_ADD_PET: SAMPLE_JSON_ADD_PET_ENDPOINT
    },
    formData: {
        POST_UPLOAD_FILE: SAMPLE_FORMDATA_UPLOAD_ENDPOINT
    }
};

