// src/server/api/routers/aiConversations.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { aiConversations } from "~/server/db/schema";

export const aiConversationsRouter = createTRPCRouter({
  // Get all conversations
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(aiConversations);
  }),
  
  // Get conversation by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select()
        .from(aiConversations)
        .where(({ id }) => id.eq(input.id));
      
      return result;
    }),
  
  // Create a new conversation
  create: publicProcedure
    .input(z.object({
      userId: z.string(),
      prompt: z.string(),
      response: z.string(),
      feedback: z.string().optional(),
      rating: z.number().optional(),
      metadata: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .insert(aiConversations)
        .values(input)
        .returning();
      
      return result;
    })
});