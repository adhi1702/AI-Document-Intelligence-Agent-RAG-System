"use client";

import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import axios from "axios";

import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";
import UploadModal from "@/components/UploadModal";

import {
  PDFDocument,
  ChatSession,
  ChatMessage,
  TextChunk,
  UploadResponse,
  ChatResponse,
} from "@/types";
import { generateSessionTitle, nextDocColor } from "@/utils/helpers";

export default function Home() {
  // ── Documents ────────────────────────────────────────────────────────────────
  const [docs, setDocs] = useState<PDFDocument[]>([]);
  const [activeDocs, setActiveDocs] = useState<string[]>([]);
  const [allChunks, setAllChunks] = useState<TextChunk[]>([]); // all chunks from all docs

  // ── Sessions ─────────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // ── Upload modal state ───────────────────────────────────────────────────────
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Chat state ───────────────────────────────────────────────────────────────
  const [isSending, setIsSending] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  function getOrCreateSession(): ChatSession {
    if (activeSession) return activeSession;
    return createSession();
  }

  function createSession(): ChatSession {
    const session: ChatSession = {
      id: uuid(),
      title: "New chat",
      messages: [],
      docIds: activeDocs,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions((prev) => [...prev, session]);
    setActiveSessionId(session.id);
    return session;
  }

  function updateSession(
    sessionId: string,
    updater: (s: ChatSession) => ChatSession
  ) {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? updater(s) : s))
    );
  }

  // ── Upload handler ────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress("Parsing PDF…");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress("Extracting text & chunking…");
      const { data }: { data: UploadResponse } = await axios.post(
        "/api/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!data.success) throw new Error(data.error ?? "Upload failed");

      setUploadProgress("Storing embeddings…");

      // Save doc + chunks
      setDocs((prev) => [...prev, data.doc]);
      setAllChunks((prev) => [...prev, ...data.chunks]);
      setActiveDocs((prev) =>
        prev.includes(data.doc.id) ? prev : [...prev, data.doc.id]
      );

      setUploadModalOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong uploading.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  }, []);

  // ── Send message handler ──────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (question: string) => {
      if (isSending || activeDocs.length === 0) return;

      const session = getOrCreateSession();
      const sessionId = session.id;

      // Build user message
      const userMsg: ChatMessage = {
        id: uuid(),
        role: "user",
        content: question,
        timestamp: new Date(),
      };

      // Add user message and a placeholder assistant message
      const assistantMsgId = uuid();
      const assistantPlaceholder: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      updateSession(sessionId, (s) => ({
        ...s,
        title:
          s.messages.length === 0
            ? generateSessionTitle(question)
            : s.title,
        messages: [...s.messages, userMsg, assistantPlaceholder],
        updatedAt: new Date(),
      }));

      setIsSending(true);

      try {
        // Build history (without the placeholder)
        const history = session.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Only send chunks belonging to active docs
        const relevantChunks = allChunks.filter((c) =>
          activeDocs.includes(c.docId)
        );

        const { data }: { data: ChatResponse } = await axios.post("/api/chat", {
          question,
          sessionId,
          history,
          chunks: relevantChunks,
        });

        if (data.error) throw new Error(data.error);

        // Replace placeholder with real answer
        updateSession(sessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: data.answer,
                  sources: data.sources,
                  isStreaming: false,
                  timestamp: new Date(),
                }
              : m
          ),
          updatedAt: new Date(),
        }));
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong.";
        updateSession(sessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: `⚠️ Error: ${msg}`,
                  isStreaming: false,
                }
              : m
          ),
        }));
      } finally {
        setIsSending(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSending, activeDocs, allChunks, sessions, activeSessionId]
  );

  // ── Toggle / remove doc ───────────────────────────────────────────────────────
  function toggleDoc(docId: string) {
    setActiveDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  }

  function removeDoc(docId: string) {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    setAllChunks((prev) => prev.filter((c) => c.docId !== docId));
    setActiveDocs((prev) => prev.filter((id) => id !== docId));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Sidebar */}
      <Sidebar
        docs={docs}
        activeDocs={activeDocs}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onToggleDoc={toggleDoc}
        onRemoveDoc={removeDoc}
        onSelectSession={setActiveSessionId}
        onNewSession={() => {
          const s = createSession();
          setActiveSessionId(s.id);
        }}
        onUploadClick={() => setUploadModalOpen(true)}
      />

      {/* Main chat area */}
      <main className="flex-1 min-w-0 h-full">
        <ChatBox
          session={activeSession}
          docs={docs}
          activeDocs={activeDocs}
          allChunks={allChunks}
          onSendMessage={handleSendMessage}
          isSending={isSending}
          onUploadClick={() => setUploadModalOpen(true)}
        />
      </main>

      {/* Upload modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          if (!isUploading) {
            setUploadModalOpen(false);
            setUploadError(null);
          }
        }}
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        error={uploadError}
      />
    </div>
  );
}
