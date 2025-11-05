import EndpointForm from './components/EndpointForm'
import PreviewPanel from './components/PreviewPanel'
import { useEndpointBuilder } from './hooks/useEndpointBuilder'

export default function App() {
  const { endpoint, update, allowed } = useEndpointBuilder()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Main Content */}
      <div className="flex-grow max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="bg-white dark:bg-gray-800 border rounded shadow-sm overflow-auto">
          <EndpointForm value={endpoint} onChange={update} allowed={allowed} />
        </div>
        <div className="bg-white dark:bg-gray-800 border rounded shadow-sm overflow-auto">
          <PreviewPanel endpoint={endpoint} />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-gray-700 dark:text-gray-500">
        reizucodes
      </footer>
    </div>
  )
}
