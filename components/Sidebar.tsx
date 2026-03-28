"use client";

import { PDFDocument, ChatSession } from "@/types";
import { truncate, timeAgo } from "@/utils/helpers";
import { cn } from "@/utils/helpers";

interface SidebarProps {
  docs: PDFDocument[];
  activeDocs: string[];
  sessions: ChatSession[];
  activeSessionId: string | null;
  onToggleDoc: (docId: string) => void;
  onRemoveDoc: (docId: string) => void;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onUploadClick: () => void;
}

export default function Sidebar({
  docs,
  activeDocs,
  sessions,
  activeSessionId,
  onToggleDoc,
  onRemoveDoc,
  onSelectSession,
  onNewSession,
  onUploadClick,
}: SidebarProps) {
  return (
    <aside className="w-64 h-full flex flex-col bg-bg-secondary border-r border-bg-border shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-bg-border flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-xs font-bold text-white shrink-0">
          ⚡
        </div>
        <div>
          <p className="font-sans font-700 text-sm text-text-primary leading-tight">
            PDF Chat
          </p>
          <p className="font-mono text-[10px] text-text-muted leading-tight">
            RAG · Groq · HuggingFace
          </p>
        </div>
      </div>

      {/* Documents section */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-mono text-[10px] tracking-widest text-text-muted uppercase">
            Documents
          </span>
          <button
            onClick={onUploadClick}
            className="text-[10px] text-accent-purple hover:text-accent-purple-glow font-mono transition-colors"
          >
            + Upload
          </button>
        </div>

        {docs.length === 0 ? (
          <button
            onClick={onUploadClick}
            className="w-full border border-dashed border-bg-border-light rounded-lg px-3 py-4 text-center hover:border-accent-purple hover:bg-bg-hover transition-all group"
          >
            <p className="font-mono text-[11px] text-text-muted group-hover:text-text-secondary">
              Upload a PDF to start
            </p>
          </button>
        ) : (
          <ul className="space-y-1">
            {docs.map((doc) => {
              const isActive = activeDocs.includes(doc.id);
              return (
                <li key={doc.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all group",
                      isActive
                        ? "bg-bg-hover"
                        : "hover:bg-bg-card"
                    )}
                    onClick={() => onToggleDoc(doc.id)}
                  >
                    {/* Color dot + checkbox */}
                    <div
                      className={cn(
                        "w-3 h-3 rounded-sm shrink-0 border transition-all",
                        isActive ? "opacity-100" : "opacity-40"
                      )}
                      style={{
                        backgroundColor: isActive ? doc.color : "transparent",
                        borderColor: doc.color,
                      }}
                    />
                    <span
                      className={cn(
                        "font-mono text-[11px] flex-1 leading-tight transition-colors",
                        isActive ? "text-text-primary" : "text-text-muted"
                      )}
                    >
                      {truncate(doc.name.replace(".pdf", ""), 22)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveDoc(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-danger text-xs transition-all"
                    >
                      ✕
                    </button>
                  </div>
                  {isActive && (
                    <p className="font-mono text-[9px] text-text-muted pl-7 pb-0.5">
                      {doc.chunkCount} chunks · {(doc.characterCount / 1000).toFixed(1)}k chars
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-bg-border" />

      {/* Sessions section */}
      <div className="px-3 flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-mono text-[10px] tracking-widest text-text-muted uppercase">
            Chats
          </span>
          <button
            onClick={onNewSession}
            className="text-[10px] text-accent-purple hover:text-accent-purple-glow font-mono transition-colors"
          >
            + New
          </button>
        </div>

        <ul className="space-y-0.5 overflow-y-auto flex-1 pr-0.5">
          {sessions.length === 0 && (
            <li className="font-mono text-[10px] text-text-muted px-2 py-2">
              No chats yet
            </li>
          )}
          {[...sessions].reverse().map((session) => (
            <li key={session.id}>
              <button
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  "w-full text-left px-2 py-2 rounded-lg transition-all",
                  session.id === activeSessionId
                    ? "bg-bg-hover text-text-primary"
                    : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                )}
              >
                <p className="font-sans text-[11px] font-600 leading-tight truncate">
                  {session.title}
                </p>
                <p className="font-mono text-[9px] text-text-muted mt-0.5">
                  {session.messages.length} msg · {timeAgo(session.updatedAt)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-bg-border">
        <p className="font-mono text-[9px] text-text-muted">
          Using{" "}
          <span className="text-accent-purple-glow">llama3-70b</span> ·{" "}
          <span className="text-accent-teal">all-MiniLM-L6-v2</span>
        </p>
      </div>
    </aside>
  );
}
