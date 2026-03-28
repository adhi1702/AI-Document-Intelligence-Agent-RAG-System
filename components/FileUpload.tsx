"use client";

import { useRef, useState } from "react";
import { cn, formatBytes } from "@/utils/helpers";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: string;
}

export default function FileUpload({
  onUpload,
  isUploading,
  uploadProgress,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (file.type !== "application/pdf") return;
    setSelectedFile(file);
    onUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl px-8 py-12 text-center cursor-pointer transition-all duration-200",
          dragOver
            ? "border-accent-purple bg-[rgba(124,58,237,0.08)]"
            : "border-bg-border-light hover:border-bg-border hover:bg-bg-card",
          isUploading && "pointer-events-none opacity-80"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            {/* Spinner */}
            <div className="w-10 h-10 rounded-full border-2 border-bg-border border-t-accent-purple animate-spin" />
            <p className="font-mono text-xs text-text-secondary">
              {uploadProgress ?? "Processing PDF…"}
            </p>
            {selectedFile && (
              <p className="font-mono text-[10px] text-text-muted">
                {selectedFile.name} · {formatBytes(selectedFile.size)}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-bg-card border border-bg-border flex items-center justify-center text-2xl">
              📄
            </div>
            <div>
              <p className="font-sans font-600 text-sm text-text-primary mb-1">
                Drop your PDF here
              </p>
              <p className="font-mono text-[11px] text-text-muted">
                or click to browse · text-based PDFs only
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              {["PDF", "RAG", "HuggingFace"].map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-bg-border text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
