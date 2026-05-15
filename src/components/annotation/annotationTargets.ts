import type { AnnotationTarget } from "@/core/annotation/contracts/AnnotationTarget"
import { listGeneratorDefinitions } from "@/core/annotation/registry/generatorRegistry"

export interface AnnotationTargetOption {
    value: AnnotationTarget
    label: string
    isDisabled?: boolean
}

export const ANNOTATION_TARGETS: readonly AnnotationTargetOption[] = [
    ...listGeneratorDefinitions().map(def => ({
        value: def.target,
        label: def.label,
        isDisabled: !def.isEnabled,
    })),
] as const satisfies readonly AnnotationTargetOption[]
