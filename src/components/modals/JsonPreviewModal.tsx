import { useState } from "react";

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
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-[650px] max-h-[80vh] overflow-auto">
              {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-lg">JSON Preview</h2> 
                    <div className="flex items-center gap-2">
                      {/* Copied indicator */}
                        {copied && <span className="text-sm">Copied!</span>}   
                      {/* Copy button */}
                        <button
                            className="px-2 py-1 border rounded hover:bg-gray-800 transition"
                            onClick={handleCopy}
                            title="Copy JSON"
                        >
                        <svg width="19" height="24" className="px-1 py-1" viewBox="0 0 512 512">
                            <path
                                fill="currentColor"
                                stroke="currentColor"
                                d="M448 0H224C188.7 0 160 28.65 160 64v224c0 35.35 28.65 64 64 64h224c35.35 0 64-28.65 64-64V64C512 28.65 483.3 0 448 0zM464 288c0 8.822-7.178 16-16 16H224C215.2 304 208 296.8 208 288V64c0-8.822 7.178-16 16-16h224c8.822 0 16 7.178 16 16V288zM304 448c0 8.822-7.178 16-16 16H64c-8.822 0-16-7.178-16-16V224c0-8.822 7.178-16 16-16h64V160H64C28.65 160 0 188.7 0 224v224c0 35.35 28.65 64 64 64h224c35.35 0 64-28.65 64-64v-64h-48V448z"
                            ></path>
                        </svg>
                        </button> 
                        {/* Close button */}
                        <button
                            className="text-md bg-gray-900 hover:bg-gray-800 px-3 py-1 rounded border-1"
                            onClick={onClose}
                            title="Close"
                        >
                            x
                        </button>
                    </div>
                </div>    
                {/* JSON Content */}
                <pre className="text-sm whitespace-pre-wrap bg-gray-800 p-3 rounded border">
                    {JSON.stringify(json, null, 2)}
                </pre>
            </div>
        </div>
    );
}
