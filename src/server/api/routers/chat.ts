// src/server/api/routers/chat.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { aiConversations } from "~/server/db/schema";
import { type InferInsertModel } from "drizzle-orm";

// Create a type for the AI conversation model
type AIConversation = InferInsertModel<typeof aiConversations> & { id: number };

export const chatRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(z.object({
      message: z.string(),
      conversationId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Here you would call your AI service (OpenAI, etc.)
      // For now, we'll mock a simple response
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock AI response
      const aiResponse = `This is Lou's response to "${input.message}"`;
      
      // Save to database and destructure the first result directly
      const [result] = await ctx.db
        .insert(aiConversations)
        .values({
          userId: "user-1", // You'd get this from auth
          prompt: input.message,
          response: aiResponse,
          timestamp: new Date(),
        })
        .returning() as [AIConversation, ...AIConversation[]]; // 👈 This is the magic!
      
      return {
        text: aiResponse,
        conversationId: result.id.toString(),
      };
    }),
});