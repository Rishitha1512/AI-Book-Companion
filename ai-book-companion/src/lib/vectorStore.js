import { QdrantClient } from "@qdrant/js-client-rest";
import { getEmbedding } from "@/lib/geminiClient";

const qdrantUrl = process.env.QDRANT_URL;
const qdrantPortRaw = process.env.QDRANT_PORT;
const qdrantPort = qdrantPortRaw ? Number(qdrantPortRaw) : undefined;

export const qdrant = new QdrantClient({
  url: qdrantUrl,
  port: Number.isFinite(qdrantPort) ? qdrantPort : undefined,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false,
});

// Name of our collection
export const COLLECTION_NAME = "books";

export async function createCollection() {
  const collections = await qdrant.getCollections();

  const exists = collections.collections.find(
    (c) => c.name === COLLECTION_NAME
  );

  if (exists) {
    console.log("Qdrant collection already exists");
    return;
  }

  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: {
      size: 768, // Gemini embeddings size
      distance: "Cosine",
    },
  });

  console.log("Qdrant collection created:", COLLECTION_NAME);
}

export async function insertChunks(chunks) {
  const points = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i]);

    points.push({
      id: Date.now() + i,
      vector: embedding,
      payload: {
        text: chunks[i],
        chunkIndex: i,
      },
    });

    console.log(`Embedded chunk ${i + 1}/${chunks.length}`);
  }

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });

  console.log(`${points.length} real chunks inserted into Qdrant`);
}

export async function searchSimilarChunks(queryEmbedding, limit = 3) {
  const results = await qdrant.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit,
  });

  return results.map((point) => point.payload.text);
}
