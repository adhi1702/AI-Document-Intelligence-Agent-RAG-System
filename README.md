# ⚡ PDF Chat — RAG-powered document Q&A

Chat with your PDFs using **Groq LLaMA3-70b**, **HuggingFace embeddings**, and an **in-memory vector store** — all inside a Next.js 14 App Router project.

---

## 🏗 Architecture

```
User uploads PDF
      │
      ▼
/api/upload
  1. pdf-parse    → extract raw text
  2. chunkText()  → split into 1000-char overlapping chunks
  3. HuggingFace  → embed each chunk (all-MiniLM-L6-v2)
  4. vectorStore  → store chunks + embeddings in memory
      │
      ▼
User asks a question
      │
      ▼
/api/chat
  1. HuggingFace  → embed the question
  2. vectorStore  → cosine similarity search → top 5 chunks
  3. Groq LLaMA3  → answer with context + chat history
      │
      ▼
     UI renders answer + source citations
```

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd pdf-chat-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```env
GROQ_API_KEY=gsk_...        # https://console.groq.com — free
HUGGINGFACE_API_TOKEN=hf_...  # https://huggingface.co/settings/tokens — free
```

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
pdf-chat-app/
│
├── app/
│   ├── layout.tsx              # Root layout + fonts
│   ├── page.tsx                # Main page — all state lives here
│   ├── globals.css             # Tailwind + custom styles
│   └── api/
│       ├── upload/route.ts     # PDF upload → parse → chunk → embed
│       └── chat/route.ts       # Question → embed → search → LLM
│
├── components/
│   ├── Sidebar.tsx             # Left panel: docs + session history
│   ├── ChatBox.tsx             # Main chat panel + input
│   ├── Message.tsx             # Single message bubble + source citations
│   ├── FileUpload.tsx          # Drag-and-drop PDF uploader
│   └── UploadModal.tsx         # Modal wrapper for file upload
│
├── lib/
│   ├── pdf.ts                  # parsePDF() + chunkText()
│   ├── embeddings.ts           # HuggingFace embedding API calls
│   ├── vectorStore.ts          # In-memory cosine similarity search
│   └── groq.ts                 # Groq API — buildSystemPrompt() + askGroq()
│
├── utils/
│   └── helpers.ts              # cn(), formatBytes(), timeAgo(), etc.
│
├── types/
│   └── index.ts                # All shared TypeScript types
│
├── .env.local.example          # Copy → .env.local and fill in keys
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔧 Key Design Decisions

| Decision | Why |
|---|---|
| In-memory vector store | Zero setup — perfect for local dev and demos. Swap for Pinecone/pgvector for production. |
| HuggingFace `all-MiniLM-L6-v2` | Free, fast, good quality for semantic search. 384-dim vectors. |
| Groq `llama3-70b-8192` | Fastest free LLM inference available. 8192-token context window. |
| 1000-char chunks / 150 overlap | Balances context per chunk vs. retrieval precision. Tune to your use case. |
| Chat history (last 10 turns) | Enables follow-up questions without exploding the context window. |

---

## 🔥 Upgrade Path

### Add Pinecone (persistent vector store)
Replace `lib/vectorStore.ts` with Pinecone client calls. Everything else stays the same.

### Add streaming responses
In `/api/chat/route.ts`, use `askGroqStream()` from `lib/groq.ts` and return a `StreamingTextResponse`.

### Add authentication
Wrap `app/layout.tsx` with NextAuth or Clerk — protect the API routes with middleware.

### Add persistent sessions
Store `ChatSession[]` in a database (Supabase, PlanetScale) instead of React state.

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `next` 14 | Framework — App Router + API routes |
| `pdf-parse` | Server-side PDF text extraction |
| `react-markdown` + `remark-gfm` | Render LLM markdown responses |
| `axios` | HTTP client for API calls |
| `uuid` | Generate unique IDs for docs, messages, sessions |
| `clsx` | Conditional Tailwind class merging |
| `tailwindcss` | Utility-first styling |
