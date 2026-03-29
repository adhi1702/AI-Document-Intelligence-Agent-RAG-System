import { NextRequest, NextResponse } from "next/server";
import { parsePDF, chunkText } from "@/lib/pdf";
import { getEmbeddings } from "@/lib/embeddings";
import { vectorStore } from "@/lib/vectorStore";
import { UploadResponse, PDFDocument } from "@/types";
import { v4 as uuid } from "uuid";
import { nextDocColor } from "@/utils/helpers";

export const runtime = "nodejs"; // pdf-parse requires Node.js runtime

export async function POST(req: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, doc: {} as PDFDocument, chunks: [], error: "No file provided." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, doc: {} as PDFDocument, chunks: [], error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    // 1. Parse PDF → raw text
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await parsePDF(buffer);

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        { success: false, doc: {} as PDFDocument, chunks: [], error: "Could not extract text. Make sure the PDF is not scanned/image-only." },
        { status: 422 }
      );
    }

    // 2. Create doc metadata
    const docId = uuid();
    const doc: PDFDocument = {
      id: docId,
      name: file.name,
      uploadedAt: new Date(),
      chunkCount: 0,       // will update below
      characterCount: rawText.length,
      color: nextDocColor(),
    };

    // 3. Chunk text
    const chunks = chunkText(rawText, docId, file.name);
    doc.chunkCount = chunks.length;

    // 4. Embed all chunks via HuggingFace (batch them to avoid timeouts)
    const BATCH_SIZE = 32;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE).map((c) => c.text);
      const batchEmbeddings = await getEmbeddings(batch);
      allEmbeddings.push(...batchEmbeddings);
    }

    // 5. Store in in-memory vector store
    vectorStore.add(chunks, allEmbeddings);
    console.log(`[upload] Successfully stored ${chunks.length} embeddings for ${file.name}`);

    return NextResponse.json({ success: true, doc, chunks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[upload] Error:", message);
    return NextResponse.json(
      { success: false, doc: {} as PDFDocument, chunks: [], error: message },
      { status: 500 }
    );
  }
}
