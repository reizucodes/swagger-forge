import type { SchemaType } from "@/domain/endpoint/models/enums";

export interface JsonField {
    property: string
    schemaType?: SchemaType
    example?: string | number | boolean | unknown[] | Record<string, unknown>
    description?: string
    children?: JsonField[] // nested fields for arrays/objects
}