import type { ParamLocation, SchemaType } from "@/domain/endpoint/models/enums"

export interface Parameter {
    id: string
    name: string
    in: ParamLocation
    required?: boolean
    schemaType?: SchemaType
    description?: string
    // TODO add example?
}