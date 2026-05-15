// generators/openapi/openApiJsonGenerator.ts
import type { Endpoint } from "@/domain/endpoint/models/Endpoint"
import type { AnnotationGenerator } from "@/core/annotation/contracts/AnnotationGenerator"

export class OpenApiJsonGenerator implements AnnotationGenerator {
    generate(endpoint: Endpoint): string {
        const spec = {
            openapi: '3.0.0',
            paths: {
                [endpoint.path]: {
                    [endpoint.method.toLowerCase()]: {
                        summary: endpoint.summary,
                        description: endpoint.description,
                        operationId: endpoint.operationId,
                        tags: endpoint.tags ? [endpoint.tags] : undefined,
                        // requestBody: /* map from JsonField[] */,
                        // responses: /* map responses */,
                    },
                },
            },
        }

        return JSON.stringify(spec, null, 2)
    }
}
