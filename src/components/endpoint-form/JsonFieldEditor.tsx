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

    return (
        <div className="p-2 border rounded space-y-2">
            <div className="grid grid-cols-5 gap-2 items-center">
                {/* Property */}
                <input
                    className="p-1 border rounded"
                    placeholder="field"
                    value={field.property}
                    onChange={e => onChange(applyJsonFieldPatch(field, { property: e.target.value }, contentType))}
                />
                {/* Type */}
                <select
                    className="p-1 border rounded"
                    value={field.schemaType || 'string'}
                    onChange={e =>
                        onChange(applyJsonFieldPatch(field, { schemaType: e.target.value as SchemaType, example: '', children: [] }, contentType))
                    }
                >
                    {allowedSchemaTypes.map(type => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
                {/* Example */}
                <input
                    className={`p-1 border rounded ${
                        disableExample ? 'cursor-not-allowed' : ''
                    }`}
                    placeholder={disableExample ? 'disabled' : 'example'}
                    disabled={disableExample}
                    value={String(disableExample ? '' : field.example)}
                    onChange={e => onChange(applyJsonFieldPatch(field, { example: e.target.value }, contentType))}
                />
                {/* Description */}
                <input
                    className="p-1 border rounded"
                    placeholder="description"
                    value={field.description || ''}
                    onChange={e => onChange(applyJsonFieldPatch(field, { description: e.target.value }, contentType))}
                />

                {/* Delete */}
                <button
                    className="text-sm text-red-600 hover:cursor-pointer justify-self-end"
                    onClick={onRemove}
                >
                    <svg height="22" width="22" fill="#ef4444" viewBox="0 0 24 24">
                        <path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"/>
                    </svg>
                </button>
            </div>

            {/* CHILDREN SECTION */}
            {(field.schemaType === 'array' || field.schemaType === 'object') && contentType !== "multipart/form-data" && (
                <div className="ml-4 border-l pl-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            Children
                            {disableChildren && field.schemaType === 'array' && (
                                <span className="text-xs text-red-400/75 ml-2">
                                    (disabled — primitive array)
                                </span>
                            )}
                        </span>

                        <button
                            className={`text-sm underline 
                                ${disableChildren ? 'text-gray-400 cursor-not-allowed' : 'hover:cursor-pointer'}`}
                            disabled={disableChildren}
                            onClick={() => {
                                if (disableChildren) return
                                const children: JsonField[] = [
                                    ...(field.children || []),
                                    { property: '', schemaType: 'string', example: '', description: '' },
                                ]
                                onChange(applyJsonFieldPatch(field, { children }, contentType))
                            }}
                        >
                            Add child
                        </button>

                    </div>

                    {/* Render children */}
                    {!disableChildren &&
                    (field.children || []).map((child, i) => (
                        <JsonFieldEditor
                            key={i}
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
