import { useState } from "react"
import type { ResponseDef } from "@/domain/endpoint/models/Response"
import type { JsonField } from "@/domain/endpoint/models/JsonField"
import { JsonFieldEditor } from "@/components/endpoint-form/JsonFieldEditor"
import { JsonImportModal } from "@/components/modals/JsonImportModal"
import { objectToJsonField } from "@/domain/endpoint/transformers/objectToJsonField"
import { Tooltip } from "@/components/Tooltip"

interface Props {
    response: ResponseDef
    onChange: (r: ResponseDef) => void
    onRemove: () => void
}

// ponytail: flat list instead of a data structure — only used in this component
const HTTP_STATUS_CODES: { code: string; label: string; group: string }[] = [
    { code: "200", label: "OK",                    group: "2xx Success" },
    { code: "201", label: "Created",               group: "2xx Success" },
    { code: "202", label: "Accepted",              group: "2xx Success" },
    { code: "204", label: "No Content",            group: "2xx Success" },
    { code: "301", label: "Moved Permanently",     group: "3xx Redirection" },
    { code: "302", label: "Found",                 group: "3xx Redirection" },
    { code: "304", label: "Not Modified",          group: "3xx Redirection" },
    { code: "400", label: "Bad Request",           group: "4xx Client Error" },
    { code: "401", label: "Unauthorized",          group: "4xx Client Error" },
    { code: "403", label: "Forbidden",             group: "4xx Client Error" },
    { code: "404", label: "Not Found",             group: "4xx Client Error" },
    { code: "405", label: "Method Not Allowed",    group: "4xx Client Error" },
    { code: "409", label: "Conflict",              group: "4xx Client Error" },
    { code: "422", label: "Unprocessable Entity",  group: "4xx Client Error" },
    { code: "429", label: "Too Many Requests",     group: "4xx Client Error" },
    { code: "500", label: "Internal Server Error", group: "5xx Server Error" },
    { code: "502", label: "Bad Gateway",           group: "5xx Server Error" },
    { code: "503", label: "Service Unavailable",   group: "5xx Server Error" },
    { code: "504", label: "Gateway Timeout",       group: "5xx Server Error" },
]

const STATUS_GROUPS = ["2xx Success", "3xx Redirection", "4xx Client Error", "5xx Server Error"]

function getCodeColorClass(code: string | undefined): string {
    if (!code) return "text-[var(--gh-text-primary)] border-[var(--gh-border)]"
    if (code.startsWith("2")) return "text-green-400 border-green-500/60"
    if (code.startsWith("3")) return "text-blue-400 border-blue-500/60"
    if (code.startsWith("4")) return "text-yellow-400 border-yellow-500/60"
    if (code.startsWith("5")) return "text-red-400 border-red-500/60"
    return "text-[var(--gh-text-primary)] border-[var(--gh-border)]"
}

export function ResponseField({ response, onChange, onRemove }: Props) {
    const colorClass = getCodeColorClass(response.code)
    const [open, setOpen] = useState<boolean>(!!(response.schema?.length))
    const [showImport, setShowImport] = useState(false)

    const schema = response.schema ?? []

    const updateField = (i: number, updated: JsonField) => {
        const next = [...schema]
        next[i] = updated
        onChange({ ...response, schema: next })
    }

    const removeField = (i: number) => {
        const next = schema.filter((_, idx) => idx !== i)
        onChange({ ...response, schema: next })
    }

    const addField = () => {
        const next: JsonField[] = [
            ...schema,
            { id: crypto.randomUUID(), property: '', schemaType: 'string', example: '', description: '' },
        ]
        onChange({ ...response, schema: next })
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 items-center">
                <select
                    className={`w-44 p-1 border rounded bg-[var(--gh-canvas)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] ${colorClass}`}
                    value={response.code || ''}
                    onChange={e => {
                        const selected = HTTP_STATUS_CODES.find(s => s.code === e.target.value)
                        onChange({ ...response, code: e.target.value, description: selected?.label ?? '' })
                    }}
                >
                    <option value="">Select status code</option>
                    {STATUS_GROUPS.map(group => (
                        <optgroup key={group} label={group}>
                            {HTTP_STATUS_CODES.filter(s => s.group === group).map(s => (
                                <option key={s.code} value={s.code}>{s.code} — {s.label}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <input
                    className="flex-1 min-w-0 p-1 border border-[var(--gh-border)] rounded bg-[var(--gh-canvas)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
                    placeholder="Description"
                    value={response.description || ''}
                    onChange={e => onChange({ ...response, description: e.target.value })}
                />
                <Tooltip label={open ? 'Collapse response body' : 'Add response body schema'}>
                    <button
                        type="button"
                        aria-label={open ? 'Collapse response body' : 'Expand response body'}
                        className="text-[var(--gh-text-secondary)] hover:opacity-80 transition"
                        onClick={() => setOpen(v => !v)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {open ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                        </svg>
                    </button>
                </Tooltip>
                <button aria-label="Remove response" className="text-[var(--gh-danger)] hover:opacity-80" onClick={onRemove}>
                    <svg height="20" width="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"></path>
                    </svg>
                </button>
            </div>
            {open && (
                <div className="ml-2 mt-2 border-l border-[var(--gh-border)] pl-3 space-y-2">
                    {schema.length > 0 && (
                        <div className="hidden sm:grid gap-2 items-center grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,3fr)_auto_auto_auto] text-xs text-[var(--gh-text-secondary)] px-2">
                            <span>Field name</span>
                            <span>Type</span>
                            <span>Example</span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}
                    <div className="space-y-2">
                    {schema.map((f, i) => (
                        <JsonFieldEditor
                            key={f.id ?? i}
                            field={f}
                            onChange={(updated) => updateField(i, updated)}
                            onRemove={() => removeField(i)}
                            contentType="application/json"
                            depth={0}
                        />
                    ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="text-sm text-[var(--gh-accent)] underline hover:opacity-80"
                            onClick={addField}
                        >
                            Add field
                        </button>
                        <Tooltip label="Import JSON as response schema">
                            <button
                                type="button"
                                className="text-sm text-[var(--gh-text-secondary)] underline hover:opacity-80"
                                onClick={() => setShowImport(true)}
                            >
                                Import
                            </button>
                        </Tooltip>
                    </div>
                </div>
            )}
        <JsonImportModal
            open={showImport}
            onClose={() => setShowImport(false)}
            sample={JSON.stringify({
                id: 1001,
                name: "Doggie",
                status: "available",
                category: {
                    id: 1,
                    name: "Dogs"
                }
            }, null, 2)}
            onImport={(jsonString) => {
                try {
                    const parsed = JSON.parse(jsonString)
                    const fields = objectToJsonField(parsed)
                    onChange({ ...response, schema: fields })
                } catch {
                    // JsonImportModal handles its own error display
                }
            }}
        />
        </div>
    )
}
