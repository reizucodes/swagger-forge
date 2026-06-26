import type { SchemaType } from "@/domain/endpoint/models/enums";

export interface JsonField {
    id?: string
    property: string
    schemaType?: SchemaType
    example?: string | number | boolean | unknown[] | Record<string, unknown>
    description?: string
    required?: boolean
    children?: JsonField[]
}