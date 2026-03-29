import { NextRequest, NextResponse } from "next/server";
import { getEmbeddings } from "@/lib/embeddings";
import { vectorStore } from "@/lib/vectorStore";
import { askGroq, GroqMessage } from "@/lib/groq";
import { ChatRequest, ChatResponse } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await req.json();
    const { question, history, chunks } = body;

    if (!question?.trim()) {
      return NextResponse.json(
        { answer: "", sources: [], error: "Question is required." },
        { status: 400 }
      );
    }

    // 1. Embed the user's question
    console.log(`[chat] Generating query embedding for: "${question.substring(0, 50)}..."`);
    const [questionEmbedding] = await getEmbeddings([question]);

    // 2. Retrieve the most relevant chunks from the vector store
    //    Filter to only the docs the user has selected (from chunks docIds)
    const activeDocIds = Array.from(new Set(chunks.map((c) => c.docId)));
    const sources = vectorStore.search(questionEmbedding, 5, activeDocIds);
    console.log(`[chat] Found ${sources.length} matching sources for query.`);

    if (sources.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant content in the uploaded documents. Try uploading a PDF first.",
        sources: [],
      });
    }

    // 3. Build message history for the LLM (last 10 turns to stay within context)
    const recentHistory = history.slice(-10);
    const messages: GroqMessage[] = [
      ...recentHistory.map((m) => ({
        role: m.role as GroqMessage["role"],
        content: m.content,
      })),
      { role: "user", content: question },
    ];

    // 4. Ask Groq with context
    const answer = await askGroq(messages, sources);

    return NextResponse.json({ answer, sources });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[chat] Error:", message);
    return NextResponse.json(
      { answer: "", sources: [], error: message },
      { status: 500 }
    );
  }
}
