import { TextChunk } from "@/types";
import { v4 as uuid } from "uuid";

const CHUNK_SIZE = 1000;   // characters per chunk
const CHUNK_OVERLAP = 150; // overlap between chunks for context continuity

/**
 * Splits a long string into overlapping chunks.
 * Tries to split on sentence boundaries to avoid cutting mid-thought.
 */
export function chunkText(
  text: string,
  docId: string,
  docName: string
): TextChunk[] {
  // Clean up whitespace
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    if (end < cleaned.length) {
      // Try to find a sentence boundary (. ! ?) to split cleanly
      const boundary = cleaned.lastIndexOf(". ", end);
      if (boundary > start + CHUNK_SIZE / 2) {
        end = boundary + 1; // include the period
      }
    }

    const text = cleaned.slice(start, end).trim();
    if (text.length > 30) {
      // Skip tiny fragments
      chunks.push({
        id: uuid(),
        docId,
        docName,
        text,
        index,
      });
      index++;
    }

    // Move forward with overlap
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

/**
 * Parses a PDF file buffer and returns plain text.
 * Called server-side only in the upload API route.
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  // Dynamic import so this stays server-only
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}
