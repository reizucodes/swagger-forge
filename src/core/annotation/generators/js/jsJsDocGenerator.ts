import type { Endpoint } from "@/domain/endpoint/models/Endpoint"
import type { AnnotationGenerator } from "@/core/annotation/contracts/AnnotationGenerator"
import type { SpecVersion } from "@/core/annotation/specs"
import { buildJsDocBlock } from "./jsDocHelpers"

export class JsJsDocGenerator implements AnnotationGenerator {
    generate(endpoint: Endpoint, spec: SpecVersion): string {
        return buildJsDocBlock(endpoint, spec).join('\n')
    }
}
