import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (jsonString: string) => void;
}

export function JsonImportModal({ open, onClose, onImport }: Props) {
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const handleValidate = () => {
        try {
            JSON.parse(input);
            setError(null);
        } catch {
            setError("Invalid JSON format");
        }
    };

    const handlePrettify = () => {
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch {
            setError("Invalid JSON — cannot prettify");
        }
    };

    const handleImport = () => {
        try {
            JSON.parse(input);
            setError(null);
            onImport(input);
            onClose();
        } catch {
            setError("Fix JSON errors first");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-[650px] max-h-[80vh] overflow-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-lg">Import JSON</h2>
                <button
                    className="text-xs bg-gray-900 hover:bg-gray-800 px-3 py-1 rounded border-1"
                    onClick={onClose}
                    title="Close"
                >
                    x
                </button>
            </div>
            {/* Buttons */}
            <div className="flex justify-between mb-3">
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 border rounded hover:bg-gray-700 text-sm"
                        onClick={handleValidate}
                    >
                        Validate
                    </button>
                    <button
                        className="px-3 py-1 border rounded hover:bg-gray-700 text-sm"
                        onClick={handlePrettify}
                    >
                        Prettify
                    </button>
                </div>
                <button
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
                    onClick={handleImport}
                >
                    Import
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="text-red-400 text-sm mb-2">{error}</div>
            )}

            {/* Textarea */}
            <textarea
                className="w-full h-64 bg-gray-800 border border-gray-700 rounded p-2 text-sm font-mono"
                value={input}
                onChange={(e) => setInput(e.target.value)}
placeholder='{
    "example": true
}'
            />
                </div>
            </div>
    );
}
