import { useState } from "react";

const COPY_FEEDBACK_MS = 1500

interface Props {
    open: boolean;
    onClose: () => void;
    json: unknown;
}

export function JsonPreviewModal({ open, onClose, json }: Props) {
    const [copied, setCopied] = useState(false);

    if (!open) return null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--gh-border)]">
                    <h2 className="font-semibold text-lg text-[var(--gh-text-primary)]">JSON Preview</h2>
                    <div className="flex items-center gap-2">
                      {/* Copied indicator */}
                        {copied && <span className="text-sm text-[var(--gh-accent)]">Copied!</span>}
                      {/* Copy button */}
                        <button
                            className="p-1.5 border border-[var(--gh-border)] rounded text-[var(--gh-accent)] hover:opacity-80 hover:border-[var(--gh-accent)] transition"
                            onClick={handleCopy}
                            aria-label="Copy JSON"
                            title="Copy JSON"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                        {/* Close button */}
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
                </div>
                {/* JSON Content */}
                <pre className="text-sm whitespace-pre-wrap bg-[var(--gh-code-bg)] text-[var(--gh-code-text)] p-3 rounded border border-[var(--gh-border)]">
                    {JSON.stringify(json, null, 2)}
                </pre>
            </div>
        </div>
    );
}
