import { getEmbedding, generateAnswer } from "@/lib/geminiClient";
import { searchSimilarChunks } from "@/lib/vectorStore";

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400 }
      );
    }

    // Embed the question
    const queryEmbedding = await getEmbedding(question);

    // Retrieve relevant book chunks
    const relevantChunks = await searchSimilarChunks(queryEmbedding, 3);

    // Combine into context
    const context = relevantChunks.join("\n\n");

    // Generate answer
    const answer = await generateAnswer(context, question);

    return new Response(
      JSON.stringify({
        question,
        answer,
        sources: relevantChunks,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ask API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to answer question" }),
      { status: 500 }
    );
  }
}
