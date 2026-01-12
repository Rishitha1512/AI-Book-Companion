import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { chunkText } from "@/lib/pdfProcessor";
import { pathToFileURL } from "url";
import path from "path";

export const runtime = "nodejs";

// 🔑 Convert worker path to file:// URL (Windows-safe)
const workerPath = pathToFileURL(
  path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  )
).toString();

pdfjs.GlobalWorkerOptions.workerSrc = workerPath;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const pdf = await pdfjs.getDocument({
      data: uint8Array,
      disableWorker: true, // still disable execution
    }).promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }

    console.log("PDF pages:", pdf.numPages);
    console.log("PDF text length:", fullText.length);
    console.log("Preview:", fullText.slice(0, 200));
    const chunks = chunkText(fullText);

    console.log("Total chunks created:", chunks.length);
    console.log("First chunk preview:", chunks[0].slice(0, 200));

    return new Response(
      JSON.stringify({
        success: true,
        pages: pdf.numPages,
        textLength: fullText.length,
        totalChunks: chunks.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("PDF processing error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process PDF" }),
      { status: 500 }
    );
  }
}
