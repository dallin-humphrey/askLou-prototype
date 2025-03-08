// src/server/api/routers/aiConversations.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { aiConversations } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { type InferSelectModel } from "drizzle-orm";

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
    })
});