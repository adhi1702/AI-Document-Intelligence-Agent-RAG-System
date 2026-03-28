# 🤖 AI Document Intelligence Agent — RAG System

> Chat with your PDF documents using **Retrieval-Augmented Generation (RAG)**. Upload any PDF, ask questions in natural language, and get precise, cited answers powered by **Groq LLaMA 3.3** for inference and **Google Gemini** for semantic embeddings.

---

## ✨ Features

- 📄 **Multi-document support** — upload and switch between multiple PDFs in a session
- 🔍 **Semantic search** — cosine similarity over Gemini embeddings for accurate chunk retrieval
- 💬 **Conversational memory** — maintains the last 10 turns for natural follow-up questions
- 📚 **Source citations** — every answer links back to the exact document and chunk
- ⚡ **Fast inference** — Groq's hardware-accelerated LLaMA 3.3 70B for near-instant responses
- 🎨 **Modern UI** — drag-and-drop upload, session history sidebar, markdown-rendered answers

---

## 🏗 Architecture

```
User uploads PDF
      │
      ▼
/api/upload
  1. pdf-parse             → extract raw text from PDF
  2. chunkText()           → split into 1000-char overlapping chunks (150-char overlap)
  3. Gemini Embeddings     → embed each chunk (gemini-embedding-001)
  4. vectorStore           → store chunks + embedding vectors in memory
      │
      ▼
User asks a question
      │
      ▼
/api/chat
  1. Gemini Embeddings     → embed the user's question
  2. vectorStore           → cosine similarity search → top 5 matching chunks
  3. Groq LLaMA 3.3-70b   → generate answer with context + conversation history
      │
      ▼
     UI renders answer with source citations
```

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/adhi1702/AI-Document-Intelligence-Agent-RAG-System.git
cd AI-Document-Intelligence-Agent-RAG-System
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your API keys:

```env
GROQ_API_KEY=gsk_...         # Free at https://console.groq.com
GEMINI_API_KEY=AIza...       # Free at https://aistudio.google.com/apikey
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting with your PDFs.

---

## 📁 Project Structure

```
pdf-chat-app/
│
├── app/
│   ├── layout.tsx              # Root layout & metadata
│   ├── page.tsx                # Main page — global state management
│   ├── globals.css             # Tailwind + custom global styles
│   └── api/
│       ├── upload/route.ts     # PDF upload → parse → chunk → embed → store
│       └── chat/route.ts       # Question → embed → vector search → LLM answer
│
├── components/
│   ├── Sidebar.tsx             # Left panel: document list + session history
│   ├── ChatBox.tsx             # Main chat panel + message input
│   ├── Message.tsx             # Individual message bubble + source citations
│   ├── FileUpload.tsx          # Drag-and-drop PDF uploader component
│   └── UploadModal.tsx         # Modal wrapper for the file upload flow
│
├── lib/
│   ├── pdf.ts                  # parsePDF() + chunkText() utilities
│   ├── embeddings.ts           # Google Gemini embedding API (gemini-embedding-001)
│   ├── vectorStore.ts          # In-memory vector store with cosine similarity search
│   └── groq.ts                 # Groq API — buildSystemPrompt() + askGroq()
│
├── utils/
│   └── helpers.ts              # Shared helpers: cn(), formatBytes(), timeAgo()
│
├── types/
│   └── index.ts                # Shared TypeScript types & interfaces
│
├── .env.local.example          # Copy to .env.local and add your API keys
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔧 Key Design Decisions

| Decision | Rationale |
|---|---|
| **In-memory vector store** | Zero setup — ideal for demos and local dev. Swap with Pinecone or pgvector for production persistence. |
| **Gemini `gemini-embedding-001`** | Free via Google AI Studio, high-quality semantic embeddings, no rate-limit surprises. |
| **Groq `llama-3.3-70b-versatile`** | State-of-the-art open-source LLM with industry-leading inference speed on Groq hardware. |
| **1000-char chunks / 150 overlap** | Balances retrieval precision with sufficient context per chunk. Tune for your documents. |
| **Top-5 chunk retrieval** | Provides rich context without overloading the LLM's context window. |
| **10-turn chat history** | Enables natural follow-up questions while keeping token usage manageable. |

---

## 🔥 Upgrade Path

### Persistent vector store (Pinecone / pgvector)
Replace `lib/vectorStore.ts` with your preferred vector DB client. The `getEmbeddings()` interface stays the same.

### Streaming responses
`lib/groq.ts` already exports `askGroqStream()`. Wire it into `/api/chat/route.ts` and return a `StreamingTextResponse` for token-by-token streaming.

### Authentication
Wrap `app/layout.tsx` with [NextAuth](https://next-auth.js.org/) or [Clerk](https://clerk.com/) and protect `/api/*` routes with middleware.

### Persistent sessions
Move `ChatSession[]` from React state into a database (Supabase, PlanetScale, etc.) for cross-session history.

### File storage
Currently PDFs are processed in-memory and not stored. Add S3 or Supabase Storage to retain original files.

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `next` 14 | Framework — App Router + serverless API routes |
| `@google/generative-ai` | Google Gemini SDK for embedding API access |
| `pdf-parse` | Server-side PDF text extraction |
| `react-markdown` + `remark-gfm` | Render LLM markdown responses in the UI |
| `axios` | HTTP client |
| `uuid` | Unique IDs for documents, messages & sessions |
| `clsx` | Conditional class name merging |
| `tailwindcss` | Utility-first CSS framework |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **LLM Inference** | Groq — LLaMA 3.3 70B Versatile |
| **Embeddings** | Google Gemini — gemini-embedding-001 |
| **PDF Parsing** | pdf-parse |
| **Vector Search** | Custom in-memory cosine similarity |

---

## 📄 License

MIT — free to use, modify, and distribute.
