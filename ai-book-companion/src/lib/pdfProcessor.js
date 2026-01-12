// This file will hold all PDF-related logic (processing, chunking, etc.)

// Split large text into overlapping chunks for RAG
export function chunkText(text, chunkSize = 800, overlap = 100) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start = end - overlap;
  }

  return chunks;
}