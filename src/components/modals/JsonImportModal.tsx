import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (jsonString: string) => void;
  sample?: string;
}

export function JsonImportModal({ open, onClose, onImport, sample }: Props) {
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [valid, setValid] = useState(false);

    useEffect(() => {
        if (!open) {
            setInput("");
            setError(null);
            setValid(false);
        }
    }, [open]);

    if (!open) return null;

    const handleValidate = () => {
        try {
            JSON.parse(input);
            setError(null);
            setValid(true);
        } catch {
            setError("Invalid JSON format");
            setValid(false);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--gh-border)]">
                <h2 className="font-semibold text-lg text-[var(--gh-text-primary)]">Import JSON</h2>
                <div className="relative group">
                  <button
                      className="p-1.5 border border-[var(--gh-border)] rounded text-[var(--gh-text-secondary)] hover:opacity-80 hover:border-[var(--gh-accent)] hover:text-[var(--gh-accent)] transition"
                      onClick={onClose}
                      aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50">
                    Close
                  </span>
                </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-between mb-3">
                <div className="flex gap-3">
                    <button
                        className="text-sm underline text-[var(--gh-text-secondary)] hover:opacity-80"
                        onClick={handleValidate}
                    >
                        Validate
                    </button>
                    <button
                        className="text-sm underline text-[var(--gh-text-secondary)] hover:opacity-80"
                        onClick={handlePrettify}
                    >
                        Prettify
                    </button>
                    {sample && (
                        <button
                            className="text-sm underline text-[var(--gh-text-secondary)] hover:opacity-80"
                            onClick={() => setInput(sample)}
                        >
                            Paste sample
                        </button>
                    )}
                </div>
                <button
                    className="text-sm underline text-[var(--gh-accent)] hover:opacity-80"
                    onClick={handleImport}
                >
                    Import
                </button>
            </div>

            {/* Feedback */}
            {error && <div className="text-[var(--gh-danger)] text-xs mb-2 ml-0.5">{error}</div>}
            {valid && !error && <div className="text-green-400 text-xs mb-2 ml-0.5">Valid JSON ✓</div>}

            {/* Textarea */}
            <textarea
                className="w-full min-h-[8rem] h-48 max-h-[30vh] bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded p-2 text-sm font-mono text-[var(--gh-code-text)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50 resize-y"
                value={input}
                onChange={(e) => { setInput(e.target.value); setValid(false); }}
placeholder='{
    "example": true
}'
            />
                </div>
            </div>
    );
}
