// ─── PDF & Chunking ───────────────────────────────────────────────────────────

export interface PDFDocument {
  id: string;
  name: string;
  uploadedAt: Date;
  chunkCount: number;
  characterCount: number;
  color: string; // for sidebar color coding
}

export interface TextChunk {
  id: string;
  docId: string;
  docName: string;
  text: string;
  index: number;
  embedding?: number[];
}

// ─── Vector Store ─────────────────────────────────────────────────────────────

export interface VectorStoreEntry {
  chunk: TextChunk;
  embedding: number[];
}

export interface SearchResult {
  chunk: TextChunk;
  score: number;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: SearchResult[]; // which chunks were used
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  docIds: string[]; // which PDFs this session uses
  createdAt: Date;
  updatedAt: Date;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface UploadResponse {
  success: boolean;
  doc: PDFDocument;
  chunks: TextChunk[];
  error?: string;
}

export interface ChatRequest {
  question: string;
  sessionId: string;
  history: { role: MessageRole; content: string }[];
  chunks: TextChunk[]; // all chunks from selected docs (sent from client)
}

export interface ChatResponse {
  answer: string;
  sources: SearchResult[];
  error?: string;
}

export interface EmbedRequest {
  texts: string[];
}

export interface EmbedResponse {
  embeddings: number[][];
  error?: string;
}
