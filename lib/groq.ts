import { SearchResult } from "@/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Builds the system prompt that instructs the LLM how to behave.
 */
export function buildSystemPrompt(sources: SearchResult[]): string {
  const contextBlock = sources
    .map(
      (s, i) =>
        `[Source ${i + 1} — ${s.chunk.docName}, chunk ${s.chunk.index + 1}]\n${s.chunk.text}`
    )
    .join("\n\n---\n\n");

  return `You are a precise and helpful assistant that answers questions based exclusively on provided PDF documents.

## Rules
- Answer ONLY using the context below. Do not use outside knowledge.
- If the answer isn't in the context, say: "I couldn't find that in the uploaded documents."
- Always cite the source document name and chunk when referencing information.
- Be concise but complete. Use markdown for formatting when helpful.
- For follow-up questions, consider the conversation history.

## Context from uploaded PDFs
${contextBlock}`;
}

/**
 * Sends a chat completion request to Groq.
 * Returns the full response as a string (non-streaming).
 */
export async function askGroq(
  messages: GroqMessage[],
  sources: SearchResult[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env.local file.");
  }

  const systemPrompt = buildSystemPrompt(sources);

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq API error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "No response received.";
}

/**
 * Sends a streaming chat completion request to Groq.
 * Returns a ReadableStream of SSE chunks — pipe this directly to the client.
 */
export async function askGroqStream(
  messages: GroqMessage[],
  sources: SearchResult[]
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env.local file.");
  }

  const systemPrompt = buildSystemPrompt(sources);

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.3,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq streaming error");
  }

  if (!response.body) throw new Error("No response body from Groq.");
  return response.body;
}
