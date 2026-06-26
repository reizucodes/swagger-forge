import { useState } from "react"
import type { JsonField } from "@/domain/endpoint/models/JsonField"
import type { RequestBodyContentType, SchemaType } from "@/domain/endpoint/models/enums"
import { applyJsonFieldPatch, getJsonFieldEditorRules } from "@/domain/endpoint/rules/jsonFieldEditing"

interface Props {
    field: JsonField
    onChange: (f: JsonField) => void
    onRemove: () => void
    contentType?: RequestBodyContentType
}

export function JsonFieldEditor({ field, onChange, onRemove, contentType }: Props) {
    const { allowedSchemaTypes, disableExample, disableChildren } = getJsonFieldEditorRules(field, contentType)
    const [showDescription, setShowDescription] = useState<boolean>(!!field.description)

    const updateChild = (i: number, patch: Partial<JsonField>) => {
        const children = [...(field.children || [])]
        children[i] = applyJsonFieldPatch(children[i], patch, contentType)
        onChange(applyJsonFieldPatch(field, { children }, contentType))
    }

    const removeChild = (i: number) => {
        const children = [...(field.children || [])]
        children.splice(i, 1)
        onChange(applyJsonFieldPatch(field, { children }, contentType))
    }

    const inputBase = "p-1 border border-[var(--gh-border)] rounded bg-[var(--gh-canvas)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none text-sm w-full"
    const inputFocusRing = "focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"

    return (
        <div className="p-2 border border-[var(--gh-border-muted)] rounded bg-[var(--gh-canvas-subtle)] space-y-2">
            <div className="grid gap-2 items-center grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,3fr)_auto_auto_auto]">
                <input
                    className={`${inputBase} ${inputFocusRing}`}
                    placeholder="field name"
                    value={field.property}
                    onChange={e => onChange(applyJsonFieldPatch(field, { property: e.target.value }, contentType))}
                />
                <select
                    className={inputBase}
                    value={field.schemaType || 'string'}
                    onChange={e =>
                        onChange(applyJsonFieldPatch(field, { schemaType: e.target.value as SchemaType, example: '', children: [] }, contentType))
                    }
                >
                    {allowedSchemaTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <input
                    className={`${inputBase} ${inputFocusRing} ${disableExample ? 'opacity-40 cursor-not-allowed' : ''}`}
                    placeholder={disableExample ? 'set via children' : 'example value'}
                    disabled={disableExample}
                    value={String(disableExample ? '' : field.example)}
                    onChange={e => onChange(applyJsonFieldPatch(field, { example: e.target.value }, contentType))}
                />
                <button
                    type="button"
                    title={field.required ? 'Required — click to make optional' : 'Optional — click to make required'}
                    aria-label={field.required ? 'Mark as optional' : 'Mark as required'}
                    onClick={() => onChange(applyJsonFieldPatch(field, { required: !field.required }, contentType))}
                    className={`transition hover:opacity-80 ${field.required ? 'text-[var(--gh-accent)]' : 'text-[var(--gh-text-secondary)] opacity-40'}`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth={field.required ? 2.5 : 1.5}
                        strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </button>
                <button
                    type="button"
                    title={showDescription ? 'Hide description' : 'Add description'}
                    aria-label={showDescription ? 'Hide description' : 'Add description'}
                    onClick={() => setShowDescription(v => !v)}
                    className={`text-[var(--gh-text-secondary)] hover:opacity-80 transition ${showDescription ? 'opacity-100' : 'opacity-40'}`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <text x="12" y="16.5" textAnchor="middle" fontStyle="italic" fontFamily="Georgia, serif" fontSize="11" fontWeight="bold" fill="currentColor" stroke="none">i</text>
                    </svg>
                </button>
                <button
                    aria-label="Remove field"
                    className="text-[var(--gh-danger)] hover:opacity-80"
                    onClick={onRemove}
                >
                    <svg height="16" width="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"/>
                    </svg>
                </button>
            </div>
            {showDescription && (
                <input
                    className={`${inputBase} ${inputFocusRing}`}
                    placeholder="description (optional)"
                    value={field.description || ''}
                    onChange={e => onChange(applyJsonFieldPatch(field, { description: e.target.value }, contentType))}
                />
            )}

            {(field.schemaType === 'array' || field.schemaType === 'object') && contentType !== "multipart/form-data" && (
                <div className="ml-4 border-l border-[var(--gh-border)] pl-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-[var(--gh-text-secondary)]">
                            Children
                            {disableChildren && field.schemaType === 'array' && (
                                <span className="ml-2 text-[var(--gh-text-disabled)]">
                                    — set values in the example field above
                                </span>
                            )}
                        </span>
                        <button
                            className={`text-sm underline ${
                                disableChildren
                                    ? 'text-[var(--gh-text-disabled)] cursor-not-allowed'
                                    : 'text-[var(--gh-accent)] hover:opacity-80'
                            }`}
                            disabled={disableChildren}
                            onClick={() => {
                                if (disableChildren) return
                                const children: JsonField[] = [
                                    ...(field.children || []),
                                    { id: crypto.randomUUID(), property: '', schemaType: 'string', example: '', description: '' },
                                ]
                                onChange(applyJsonFieldPatch(field, { children }, contentType))
                            }}
                        >
                            Add child
                        </button>
                    </div>
                    {!disableChildren && (field.children || []).map((child, i) => (
                        <JsonFieldEditor
                            key={child.id ?? i}
                            field={child}
                            onChange={(updated) => updateChild(i, updated)}
                            onRemove={() => removeChild(i)}
                            contentType={contentType}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
