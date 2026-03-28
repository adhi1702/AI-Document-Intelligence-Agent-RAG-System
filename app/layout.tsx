import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Chat — RAG-powered document Q&A",
  description:
    "Upload PDFs and chat with them using Groq LLaMA3 + HuggingFace embeddings + in-memory RAG.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  );
}
