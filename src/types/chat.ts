// src/types/chat.ts
import { type Brand } from "./branded";
import { type ConversationId, type UserId } from "./branded";

export type MessageId = Brand<string, "MessageId">;

export enum MessageRole {
  User = "user",
  Assistant = "assistant",
  System = "system",
}

export interface ChatMessage {
  id: MessageId;
  conversationId: ConversationId;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ChatThread {
  id: ConversationId;
  userId: UserId;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions
export const createMessageId = (id: string): MessageId => id as MessageId;