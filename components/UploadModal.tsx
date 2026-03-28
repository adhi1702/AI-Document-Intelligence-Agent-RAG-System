"use client";

import { useEffect } from "react";
import FileUpload from "./FileUpload";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: string;
  error?: string | null;
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
  uploadProgress,
  error,
}: UploadModalProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isUploading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isUploading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isUploading && onClose()}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-bg-secondary border border-bg-border rounded-2xl p-6 shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-sans font-700 text-base text-text-primary">
              Upload PDF
            </h2>
            <p className="font-mono text-[10px] text-text-muted mt-0.5">
              Text will be chunked + embedded with HuggingFace
            </p>
          </div>
          {!isUploading && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Uploader */}
        <FileUpload
          onUpload={onUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)]">
            <p className="font-mono text-[11px] text-text-danger">{error}</p>
          </div>
        )}

        {/* Pipeline info */}
        {!isUploading && !error && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { step: "01", label: "Parse PDF", sub: "pdf-parse" },
              { step: "02", label: "Chunk text", sub: "1000 char / 150 overlap" },
              { step: "03", label: "Embed chunks", sub: "all-MiniLM-L6-v2" },
            ].map(({ step, label, sub }) => (
              <div
                key={step}
                className="bg-bg-card border border-bg-border rounded-xl p-3 text-center"
              >
                <p className="font-mono text-[9px] text-accent-purple mb-1">
                  {step}
                </p>
                <p className="font-sans text-[11px] font-600 text-text-primary">
                  {label}
                </p>
                <p className="font-mono text-[9px] text-text-muted mt-0.5">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
