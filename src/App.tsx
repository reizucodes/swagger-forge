import EndpointForm from '@/components/endpoint-form/EndpointForm'
import PreviewPanel from '@/components/preview/PreviewPanel'
import { useEndpointForm } from '@/hooks/useEndpointForm'

export default function App() {
  const { endpoint, update, allowed } = useEndpointForm()
  const year: number = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-800/95 text-gray-800 dark:text-neutral-100">
      {/* Main Content */}
      <div className="flex-grow max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="bg-white dark:bg-neutral-800 dark:text-neutral-400 border rounded shadow-sm overflow-auto md:text-sm">
          <EndpointForm value={endpoint} onChange={update} allowed={allowed} />
        </div>
        <div className="bg-white dark:bg-neutral-800 dark:text-neutral-400 border rounded shadow-sm overflow-auto">
          <PreviewPanel endpoint={endpoint} />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-neutral-700 dark:text-neutral-500">
        reizucodes © {year}
      </footer>
    </div>
  )
}
