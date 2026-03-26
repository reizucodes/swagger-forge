export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type ParamLocation = 'path' | 'query' | 'header'

export type SchemaType =
    | 'string'
    | 'integer'
    | 'boolean'
    | 'number'
    | 'array'
    | 'object'
    | 'file'

export type RequestBodyContentType =
    | 'application/json'
    | 'multipart/form-data'
    | 'application/x-www-form-urlencoded'