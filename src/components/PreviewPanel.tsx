import { useState } from 'react'
import type { Endpoint } from '../types/index'
import { generateOaAnnotation } from '../utils/generateAnnotation'

interface Props {
  endpoint: Endpoint
}

export default function PreviewPanel({ endpoint }: Props) {
  const annotation = generateOaAnnotation(endpoint)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(annotation)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500) // hide after 1.5s
  }

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Generated Annotation</h3>
        <div className="flex items-center gap-2">
          {copied && <span className="text-sm">Copied!</span>}
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={copy}
          >
            <svg width="24" height="24" className="px-1 py-1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" stroke="currentColor" d="M448 0H224C188.7 0 160 28.65 160 64v224c0 35.35 28.65 64 64 64h224c35.35 0 64-28.65 64-64V64C512 28.65 483.3 0 448 0zM464 288c0 8.822-7.178 16-16 16H224C215.2 304 208 296.8 208 288V64c0-8.822 7.178-16 16-16h224c8.822 0 16 7.178 16 16V288zM304 448c0 8.822-7.178 16-16 16H64c-8.822 0-16-7.178-16-16V224c0-8.822 7.178-16 16-16h64V160H64C28.65 160 0 188.7 0 224v224c0 35.35 28.65 64 64 64h224c35.35 0 64-28.65 64-64v-64h-48V448z">
              </path>
            </svg>
          </button>
        </div>
      </div>

      <pre className="flex-1 overflow-auto p-4 border rounded font-mono text-sm whitespace-pre-wrap">
        {annotation}
      </pre>

      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        Tip: Paste above your controller method.  
        If you’re using <code>l5-swagger</code>, keep method-level <code>@OA</code> annotations here.
      </div>
    </div>
  )
}
