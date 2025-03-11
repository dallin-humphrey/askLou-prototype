// src/server/api/routers/aiConversations.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { aiConversations } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { type InferSelectModel } from "drizzle-orm";
import OpenAI from "openai";
import { env } from "~/env";

// Define the conversation type based on the schema
export type AIConversation = InferSelectModel<typeof aiConversations>;

export const aiConversationsRouter = createTRPCRouter({
  // Get all conversations with proper return type
  getAll: publicProcedure.query(async ({ ctx }): Promise<AIConversation[]> => {
    return await ctx.db.select().from(aiConversations);
  }),
  
  // Get conversation by ID with proper return type and null handling
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }): Promise<AIConversation | null> => {
      const results = await ctx.db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, input.id));
      
      return results[0] ?? null;
    }),
  
  // Create a new conversation with proper return type and tuple assertion
  create: publicProcedure
    .input(z.object({
      userId: z.string(),
      prompt: z.string(),
      response: z.string(),
      feedback: z.string().optional(),
      rating: z.number().optional(),
      metadata: z.string().optional()
    }))
    .mutation(async ({ ctx, input }): Promise<AIConversation> => {
      const [result] = await ctx.db
        .insert(aiConversations)
        .values(input)
        .returning() as [AIConversation, ...AIConversation[]];
      
      return result;
    }),
    
  // New procedure: Get response from OpenAI and store the conversation
  chatWithAI: publicProcedure
  .input(z.object({
    userId: z.string(),
    prompt: z.string(),
    metadata: z.string().optional()
  }))
  .mutation(async ({ ctx, input }): Promise<AIConversation> => {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    try {
      console.log("OpenAI API Key:", env.OPENAI_API_KEY.substring(0, 7) + "...");
      console.log("Sending request to OpenAI with prompt:", input.prompt);
      
      // Get response from OpenAI
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: input.prompt }],
      });

      console.log("Received response from OpenAI:", aiResponse);

      const responseText = aiResponse.choices[0]?.message?.content ?? "No response generated";
      
      // Store the conversation in the database
      const [result] = await ctx.db
        .insert(aiConversations)
        .values({
          userId: input.userId,
          prompt: input.prompt,
          response: responseText,
          metadata: input.metadata
        })
        .returning() as [AIConversation, ...AIConversation[]];
      
      return result;
    } catch (error) {
      console.error("OpenAI API error:", error);
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      } else {
        throw new Error("Failed to get response from OpenAI");
      }
    }
  })
});