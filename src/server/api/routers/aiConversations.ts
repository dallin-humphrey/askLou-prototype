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
    conversationId: z.string().optional(), // Add this to link messages
    metadata: z.string().optional()
  }))
  .mutation(async ({ ctx, input }): Promise<AIConversation> => {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    try {
      // Prepare message history
      const messages = [];
      
      // If conversationId exists, fetch previous messages in this conversation
      if (input.conversationId) {
        const previousMessages = await ctx.db
          .select()
          .from(aiConversations)
          .where(eq(aiConversations.id, parseInt(input.conversationId)))
          .orderBy(aiConversations.timestamp, 'asc');
          
        // Build message history for context
        for (const msg of previousMessages) {
          messages.push({ role: "user", content: msg.prompt });
          messages.push({ role: "assistant", content: msg.response });
        }
      }
      
      // Add the current prompt
      messages.push({ role: "user", content: input.prompt });
      
      console.log("Sending request to OpenAI with messages:", messages);
      
      // Get response from OpenAI with full context
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

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
  }),
  
  // Update conversation rating
  updateRating: publicProcedure
    .input(z.object({
      conversationId: z.number(),
      rating: z.number().min(0).max(5)
    }))
    .mutation(async ({ ctx, input }): Promise<AIConversation> => {
      const [result] = await ctx.db
        .update(aiConversations)
        .set({ rating: input.rating })
        .where(eq(aiConversations.id, input.conversationId))
        .returning() as [AIConversation, ...AIConversation[]];
        
      return result;
    })
});