import type { Parameter } from "@/domain/endpoint/models/Parameter"
import type { ParamLocation, SchemaType } from "@/domain/endpoint/models/enums";

interface Props {
    parameter: Parameter
    allowed: { path: boolean; query: boolean }
    onChange: (p: Parameter) => void
    onRemove: () => void
}

export function ParameterField({ parameter, allowed, onChange, onRemove }: Props) {
    return (
        <div className="p-2 border border-[var(--gh-border-muted)] rounded bg-[var(--gh-canvas-subtle)] space-y-2">
            {/* Row 1: Name + Location + Type + Required + Remove */}
            <div className="flex flex-wrap gap-2 items-center">
                {/* Name */}
                <input
                    className="flex-1 min-w-[100px] p-1 border border-[var(--gh-border)] rounded bg-[var(--gh-canvas)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
                    value={parameter.name}
                    onChange={e => onChange({ ...parameter, name: e.target.value })}
                    placeholder="field"
                />

                {/* Parameter Location */}
                <select
                    className="p-1 border border-[var(--gh-border)] rounded bg-[var(--gh-canvas)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none"
                    value={parameter.in}
                    onChange={e => onChange({ ...parameter, in: e.target.value as ParamLocation })}
                >
                    {allowed.path && <option value="path">path</option>}
                    {allowed.query && <option value="query">query</option>}
                    <option value="header">header</option>
                </select>

                {/* Type */}
                <select
                    className="p-1 border border-[var(--gh-border)] rounded bg-[var(--gh-canvas)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none"
                    value={parameter.schemaType || 'string'}
                    onChange={e => onChange({ ...parameter, schemaType: e.target.value as SchemaType })}
                >
                    <option value="string">string</option>
                    <option value="integer">integer</option>
                    <option value="boolean">boolean</option>
                    <option value="number">number</option>
                </select>

                {/* Required Toggle */}
                <div className="relative group">
                    <button
                        type="button"
                        aria-pressed={parameter.required}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            parameter.required
                                ? 'bg-[var(--gh-required-bg)] text-[var(--gh-required-text)]'
                                : 'bg-[var(--gh-canvas-inset)] text-[var(--gh-text-secondary)]'
                        }`}
                        onClick={() => onChange({ ...parameter, required: !parameter.required })}
                    >
                        {parameter.required ? 'Required' : 'Optional'}
                    </button>
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50">
                        {parameter.required ? 'Required' : 'Optional'}
                    </span>
                </div>

                {/* Remove Button */}
                <button
                    aria-label="Remove parameter"
                    className="text-[var(--gh-danger)] hover:opacity-80 ml-auto"
                    onClick={onRemove}
                >
                    <svg
                        height="20"
                        width="20"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z" />
                    </svg>
                </button>
            </div>

            {/* Row 2: Description */}
            <input
                className="w-full p-1 border border-[var(--gh-border)] rounded bg-[var(--gh-canvas)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
                value={parameter.description || ''}
                onChange={e => onChange({ ...parameter, description: e.target.value })}
                placeholder="description"
            />
        </div>
    )
}
