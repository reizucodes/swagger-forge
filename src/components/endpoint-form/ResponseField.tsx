import type { ResponseDef } from '../../types/index'

interface Props {
    response: ResponseDef
    onChange: (r: ResponseDef) => void
    onRemove: () => void
}

export function ResponseField({ response, onChange, onRemove }: Props) {
    return (
        <div className="grid grid-cols-3 gap-2 items-center">
            <input className="p-1 border rounded" value={response.code || ''} onChange={e => onChange({ ...response, code: e.target.value })} />
            <input className="p-1 border rounded col-span-1" value={response.description || ''} onChange={e => onChange({ ...response, description: e.target.value })} />
            <button className="text-sm text-red-600 hover:cursor-pointer justify-self-end mr-2" onClick={onRemove}>
                <svg height= "22" width="22" fill="#ef4444" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"></path></g></svg>
            </button>
        </div>
    )
}
