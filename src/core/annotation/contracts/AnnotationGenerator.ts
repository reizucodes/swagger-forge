import type { Endpoint } from "@/domain/endpoint/models/Endpoint"
import type { SpecVersion } from '@/core/annotation/specs'

export interface AnnotationGenerator {
    generate(endpoint: Endpoint, spec: SpecVersion): string
}