import { TextChunk, VectorStoreEntry, SearchResult } from "@/types";
import { cosineSimilarity } from "./embeddings";

/**
 * In-memory vector store.
 *
 * Lives in module scope — persists across requests within the same
 * Next.js server process (dev + single-instance prod).
 *
 * For multi-instance or persistent storage, swap this for Pinecone,
 * Upstash Vector, or a pg+pgvector database.
 */
class InMemoryVectorStore {
  private entries: VectorStoreEntry[] = [];

  /** Add chunks with their embeddings to the store. */
  add(chunks: TextChunk[], embeddings: number[][]): void {
    for (let i = 0; i < chunks.length; i++) {
      this.entries.push({ chunk: chunks[i], embedding: embeddings[i] });
    }
  }

  /** Remove all chunks belonging to a specific document. */
  removeByDocId(docId: string): void {
    this.entries = this.entries.filter((e) => e.chunk.docId !== docId);
  }

  /** Find the top-N most similar chunks to a query embedding. */
  search(queryEmbedding: number[], topN = 5, docIds?: string[]): SearchResult[] {
    let pool = this.entries;

    // Optionally filter to specific documents
    if (docIds && docIds.length > 0) {
      pool = pool.filter((e) => docIds.includes(e.chunk.docId));
    }

    if (pool.length === 0) return [];

    const scored = pool.map((entry) => ({
      chunk: entry.chunk,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  /** Total number of stored chunks. */
  get size(): number {
    return this.entries.length;
  }

  /** All unique doc IDs currently in the store. */
  get docIds(): string[] {
    return [...new Set(this.entries.map((e) => e.chunk.docId))];
  }
}

// Singleton — one store for the entire server process
export const vectorStore = new InMemoryVectorStore();
