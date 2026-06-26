import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (jsonString: string) => void;
}

export function JsonImportModal({ open, onClose, onImport }: Props) {
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setInput("");
            setError(null);
        }
    }, [open]);

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--gh-border)]">
                <h2 className="font-semibold text-lg text-[var(--gh-text-primary)]">Import JSON</h2>
                <button
                    className="p-1.5 border border-[var(--gh-border)] rounded text-[var(--gh-text-secondary)] hover:opacity-80 transition"
                    onClick={onClose}
                    aria-label="Close"
                    title="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
            </div>
            {/* Buttons */}
            <div className="flex justify-between mb-3">
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 border border-[var(--gh-border)] rounded hover:bg-[var(--gh-canvas-inset)] text-sm text-[var(--gh-text-primary)]"
                        onClick={handleValidate}
                    >
                        Validate
                    </button>
                    <button
                        className="px-3 py-1 border border-[var(--gh-border)] rounded hover:bg-[var(--gh-canvas-inset)] text-sm text-[var(--gh-text-primary)]"
                        onClick={handlePrettify}
                    >
                        Prettify
                    </button>
                </div>
                <button
                    className="px-3 py-1 bg-[var(--gh-accent)] hover:opacity-90 text-white rounded text-sm"
                    onClick={handleImport}
                >
                    Import
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="text-[var(--gh-danger)] text-xs mb-2 ml-0.5">{error}</div>
            )}

            {/* Textarea */}
            <textarea
                className="w-full h-64 bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded p-2 text-sm font-mono text-[var(--gh-code-text)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
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
