// src/types/conversations.ts

import { type ConversationId, type Rating, type Timestamp, type UserId } from "./branded";

export interface AIConversation {
  id: ConversationId;
  userId: UserId;
  timestamp: Timestamp;
  prompt: string;
  response: string;
  feedback?: string | null;
  rating: Rating | null;
}