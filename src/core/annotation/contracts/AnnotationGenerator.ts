import type { Endpoint } from "@/domain/endpoint/models/Endpoint"

export interface AnnotationGenerator {
    generate(endpoint: Endpoint): string
}