import type { JsonField } from "@/domain/endpoint/models/JsonField"

export interface ResponseDef {
    id: string
    code?: string
    description?: string
    example?: unknown
    schema?: JsonField[]
}