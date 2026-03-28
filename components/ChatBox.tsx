"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, ChatSession, PDFDocument, TextChunk } from "@/types";
import Message from "./Message";
import { cn } from "@/utils/helpers";

interface ChatBoxProps {
  session: ChatSession | null;
  docs: PDFDocument[];
  activeDocs: string[];
  allChunks: TextChunk[];
  onSendMessage: (question: string) => void;
  isSending: boolean;
  onUploadClick: () => void;
}

const SUGGESTED_QUESTIONS = [
  "Summarize the main points of this document",
  "What are the key conclusions?",
  "List the most important facts mentioned",
  "What topics does this document cover?",
];

export default function ChatBox({
  session,
  docs,
  activeDocs,
  allChunks,
  onSendMessage,
  isSending,
  onUploadClick,
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  function handleSend() {
    const q = input.trim();
    if (!q || isSending) return;
    setInput("");
    onSendMessage(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const activeChunkCount = allChunks.filter((c) =>
    activeDocs.includes(c.docId)
  ).length;

  const hasActiveDocs = activeDocs.length > 0;
  const hasMessages = (session?.messages?.length ?? 0) > 0;

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Top bar */}
      <div className="px-5 py-3 border-b border-bg-border flex items-center gap-3 shrink-0">
        {activeDocs.length > 0 ? (
          <div className="flex items-center gap-2 flex-wrap">
            {activeDocs.map((docId) => {
              const doc = docs.find((d) => d.id === docId);
              if (!doc) return null;
              return (
                <span
                  key={docId}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: doc.color + "60",
                    color: doc.color,
                    background: doc.color + "15",
                  }}
                >
                  {doc.name.replace(".pdf", "")}
                </span>
              );
            })}
            <span className="font-mono text-[9px] text-text-muted">
              {activeChunkCount} chunks indexed
            </span>
          </div>
        ) : (
          <span className="font-mono text-[10px] text-text-muted">
            No documents selected
          </span>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 min-h-0">
        {!hasActiveDocs ? (
          /* Empty: no docs uploaded */
          <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-bg-card border border-bg-border flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <p className="font-sans font-700 text-base text-text-primary mb-1">
                No PDFs loaded
              </p>
              <p className="font-mono text-xs text-text-muted max-w-xs">
                Upload a PDF from the sidebar to start asking questions
              </p>
            </div>
            <button
              onClick={onUploadClick}
              className="font-mono text-xs px-4 py-2 rounded-xl border border-accent-purple text-accent-purple hover:bg-[rgba(124,58,237,0.1)] transition-all"
            >
              + Upload PDF
            </button>
          </div>
        ) : !hasMessages ? (
          /* Empty: docs loaded but no messages yet */
          <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-5">
            <div>
              <p className="font-sans font-700 text-base text-text-primary mb-1">
                Ready to answer
              </p>
              <p className="font-mono text-xs text-text-muted">
                Ask anything about your documents
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => onSendMessage(q)}
                  className="text-left font-mono text-[11px] text-text-secondary px-3 py-2.5 rounded-xl border border-bg-border hover:border-bg-border-light hover:bg-bg-card hover:text-text-primary transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <>
            {session!.messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-4 border-t border-bg-border shrink-0">
        <div
          className={cn(
            "flex items-end gap-3 bg-bg-card border rounded-2xl px-4 py-3 transition-all",
            hasActiveDocs
              ? "border-bg-border-light focus-within:border-accent-purple"
              : "border-bg-border opacity-50 pointer-events-none"
          )}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasActiveDocs
                ? "Ask a question about your PDFs… (Enter to send)"
                : "Upload a PDF first"
            }
            disabled={!hasActiveDocs || isSending}
            className="flex-1 bg-transparent resize-none font-sans text-sm text-text-primary placeholder-text-muted outline-none leading-relaxed max-h-40 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending || !hasActiveDocs}
            className={cn(
              "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all text-sm",
              input.trim() && !isSending && hasActiveDocs
                ? "bg-accent-purple hover:bg-accent-purple-dim text-white"
                : "bg-bg-secondary text-text-muted cursor-not-allowed"
            )}
          >
            {isSending ? (
              <div className="w-3.5 h-3.5 border border-text-muted border-t-transparent rounded-full animate-spin" />
            ) : (
              "↑"
            )}
          </button>
        </div>
        <p className="font-mono text-[9px] text-text-muted mt-1.5 px-1">
          Shift+Enter for new line · answers grounded in your documents only
        </p>
      </div>
    </div>
  );
}
