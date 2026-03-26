import type { HttpMethod } from "@/domain/endpoint/models/enums"

export interface AllowedSections {
    path: boolean
    query: boolean
    body: boolean
}

export function getAllowedSections(method: HttpMethod): AllowedSections {
    switch (method) {
        case 'get':
            return { path: true, query: true, body: false }
        case 'post':
        case 'put':
        case 'patch':
            return { path: true, query: true, body: true }
        case 'delete':
        return { path: true, query: true, body: false }
        default:
            return { path: true, query: true, body: false }
    }
}