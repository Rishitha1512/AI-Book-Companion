import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: "http://localhost:6333",
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
  const points = chunks.map((chunk, index) => ({
    id: index + 1,
    vector: new Array(768).fill(0), // TEMP: fake vector (we'll replace with real embeddings later)
    payload: {
      text: chunk,
      chunkIndex: index,
    },
  }));

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });

  console.log(`${points.length} chunks inserted into Qdrant`);
}