import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function generateAnswer(context, question) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are an AI assistant.
Answer the question using ONLY the provided book content.
If the answer is not present, say "The book does not contain this information."

Book content:
${context}

Question:
${question}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
