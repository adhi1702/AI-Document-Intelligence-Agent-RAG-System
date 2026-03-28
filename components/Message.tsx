"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/types";
import { cn, timeAgo, truncate } from "@/utils/helpers";

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-up px-4 py-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold mt-0.5",
          isUser
            ? "bg-accent-purple text-white"
            : "bg-bg-card border border-bg-border text-text-secondary"
        )}
      >
        {isUser ? "U" : "⚡"}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[78%] flex flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-[rgba(124,58,237,0.18)] border border-[rgba(124,58,237,0.3)] text-text-primary rounded-tr-sm"
              : "bg-bg-card border border-bg-border text-text-primary rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p className="font-sans text-sm whitespace-pre-wrap">
              {message.content}
            </p>
          ) : message.isStreaming ? (
            <div className="flex items-center gap-1.5 py-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono text-[9px] text-text-muted">
            {timeAgo(message.timestamp)}
          </span>

          {/* Sources toggle */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <button
              onClick={() => setShowSources((p) => !p)}
              className="font-mono text-[9px] text-accent-purple hover:text-accent-purple-glow transition-colors"
            >
              {showSources ? "▲ hide sources" : `▼ ${message.sources.length} sources`}
            </button>
          )}
        </div>

        {/* Sources panel */}
        {showSources && message.sources && message.sources.length > 0 && (
          <div className="w-full space-y-1.5 mt-1 animate-fade-up">
            {message.sources.map((src, i) => (
              <div
                key={i}
                className="bg-bg-secondary border border-bg-border rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] text-accent-teal">
                    {src.chunk.docName}
                  </span>
                  <span className="font-mono text-[9px] text-text-muted">
                    chunk {src.chunk.index + 1}
                  </span>
                  <span className="ml-auto font-mono text-[9px] text-text-muted">
                    score {src.score.toFixed(3)}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-text-secondary leading-relaxed">
                  {truncate(src.chunk.text, 200)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
