// src/scripts/seed.ts
import "dotenv/config"; // Add this line at the top
import { db } from "~/server/db";
import { aiConversations } from "~/server/db/schema";

async function main() {
  await db.insert(aiConversations).values([
    {
      userId: "user1",
      prompt: "What is the capital of France?",
      response: "The capital of France is Paris.",
      feedback: "Accurate response",
      rating: 5,
      metadata: JSON.stringify({ model: "askLou-prototype-v1", tokens: 15 }),
    },
    {
      userId: "user2",
      prompt: "How do I bake a chocolate cake?",
      response: "Here's a recipe for chocolate cake...",
      feedback: "Missing some ingredients",
      rating: 3,
      metadata: JSON.stringify({ model: "askLou-prototype-v1", tokens: 120 }),
    },
  ]);
  
  console.log("Database seeded!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});