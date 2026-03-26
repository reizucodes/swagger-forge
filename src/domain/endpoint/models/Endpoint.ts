import type { HttpMethod, RequestBodyContentType } from "@/domain/endpoint/models/enums"
import type { JsonField } from "@/domain/endpoint/models/JsonField"
import type { Parameter } from "@/domain/endpoint/models/Parameter"
import type { ResponseDef } from "@/domain/endpoint/models/Response"

export interface Endpoint {
    method: HttpMethod
    path: string
    operationId?: string
    tags?: string
    summary?: string
    description?: string
    parameters?: Parameter[]
    requestBodyJsonFields?: JsonField[] // per-field schema
    requestBodyContentType?: RequestBodyContentType
    responses?: ResponseDef[]
    security?: { bearer?: boolean }
}