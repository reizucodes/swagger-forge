import type { Endpoint } from '../../../../types'
import type { AnnotationGenerator } from '../../contracts'

// Sample only
export class JsJsDocGenerator implements AnnotationGenerator {
    generate(e: Endpoint): string {
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
