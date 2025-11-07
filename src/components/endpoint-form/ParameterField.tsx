import type { Parameter, ParamLocation } from '../../types/index'

interface Props {
    parameter: Parameter
    allowed: { path: boolean; query: boolean }
    onChange: (p: Parameter) => void
    onRemove: () => void
}

export function ParameterField({ parameter, allowed, onChange, onRemove }: Props) {
    return (
        <div className="p-2 border rounded grid grid-cols-6 gap-2 items-center">
            <input
                className="col-span-2 p-1 border rounded"
                value={parameter.name}
                onChange={e => onChange({ ...parameter, name: e.target.value })}
                placeholder='query'
            />
            <select
                className="p-1 border rounded"
                value={parameter.in}
                onChange={e => onChange({ ...parameter, in: e.target.value as ParamLocation })}
            >
                {allowed.path && <option value="path">path</option>}
                {allowed.query && <option value="query">query</option>}
                <option value="header">header</option>
            </select>
            <select
                className="p-1 border rounded"
                value={parameter.schemaType || 'string'}
                onChange={e => onChange({ ...parameter, schemaType: e.target.value as any })}
            >
                <option value="string">string</option>
                <option value="integer">integer</option>
                <option value="boolean">boolean</option>
                <option value="number">number</option>
            </select>
            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={!!parameter.required}
                    onChange={e => onChange({ ...parameter, required: e.target.checked })}
                />
                required
            </label>
            <button className="text-sm text-red-600 hover:cursor-pointer justify-self-end" onClick={onRemove}>
                <svg height= "22" width="22" fill="#ef4444" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"></path></g></svg>
            </button>
        </div>
    )
}
