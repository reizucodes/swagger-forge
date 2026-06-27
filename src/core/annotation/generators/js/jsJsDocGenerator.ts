import type { Endpoint } from "@/domain/endpoint/models/Endpoint"
import type { AnnotationGenerator } from "@/core/annotation/contracts/AnnotationGenerator"
import type { SpecVersion } from "@/core/annotation/specs"

// Sample only
export class JsJsDocGenerator implements AnnotationGenerator {
    generate(e: Endpoint, _spec: SpecVersion): string {
        const lines: string[] = []

        lines.push('/**')
        lines.push(' * @openapi')
        lines.push(` * ${e.path}:`)
        lines.push(` *   ${e.method.toLowerCase()}:`)

        if (e.summary) {
          lines.push(` *     summary: ${e.summary}`)
        }

        lines.push(' */')

        return lines.join('\n')
    }
}
