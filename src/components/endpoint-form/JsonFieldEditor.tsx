import type { JsonField } from '../../types/index'

interface Props {
    field: JsonField
    onChange: (f: JsonField) => void
    onRemove: () => void
}

export function JsonFieldEditor({ field, onChange, onRemove }: Props) {
    const updateChild = (i: number, patch: Partial<JsonField>) => {
        const children = [...(field.children || [])]
        children[i] = { ...children[i], ...patch }
        onChange({ ...field, children })
    }

    const removeChild = (i: number) => {
        const children = [...(field.children || [])]
        children.splice(i, 1)
        onChange({ ...field, children })
    }

    return (
        <div className="p-2 border rounded space-y-2">
            <div className="grid grid-cols-5 gap-2 items-center">
                <input
                    className="p-1 border rounded"
                    placeholder="field"
                    value={field.property}
                    onChange={e => onChange({ ...field, property: e.target.value })}
                />
                <select
                    className="p-1 border rounded"
                    value={field.schemaType || 'string'}
                    onChange={e => onChange({ ...field, schemaType: e.target.value as any })}
                >
                    <option value="string">string</option>
                    <option value="integer">integer</option>
                    <option value="boolean">boolean</option>
                    <option value="number">number</option>
                    <option value="array">array</option>
                    <option value="object">object</option>
                </select>
                <input
                    className={`p-1 border rounded ${field.schemaType === 'object' || field.schemaType === 'array' ? 'cursor-not-allowed' : ''}`}
                    placeholder={field.schemaType === 'object' || field.schemaType === 'array' ? 'disabled' : 'example'}
                    disabled={field.schemaType === 'object' || field.schemaType === 'array'}
                    value={String(field.schemaType === 'object' || field.schemaType === 'array' ? '' : field.example)}
                    onChange={e => onChange({ ...field, example: e.target.value })}
                />
                <input
                    className="p-1 border rounded"
                    placeholder="description"
                    value={field.description || ''}
                    onChange={e => onChange({ ...field, description: e.target.value })}
                />
                <button className="text-sm text-red-600 hover:cursor-pointer justify-self-end" onClick={onRemove}>
                    <svg height= "22" width="22" fill="#ef4444" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"></path></g></svg>
                </button>
            </div>

            {(field.schemaType === 'array' || field.schemaType === 'object') && (
                <div className="ml-4 border-l pl-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Children</span>
                        <button
                            className="text-sm underline hover:cursor-pointer"
                            onClick={() => {
                                const children: JsonField[] = [...(field.children || []), { property: '', schemaType: 'string', example: '', description: '' }]
                                onChange({ ...field, children })
                            }}
                        >
                            Add child
                        </button>
                    </div>
                    {(field.children || []).map((child, i) => (
                        <JsonFieldEditor
                            key={i}
                            field={child}
                            onChange={updated => updateChild(i, updated)}
                            onRemove={() => removeChild(i)}
                        />
                    ))}
                </div>
            )}
        </div>
)}
