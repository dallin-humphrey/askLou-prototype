/**
 * Branded type utility - gives us nominal typing in TypeScript's structural type system
 */
export type Brand<K, T> = K & { __brand: T };

export type ConversationId = Brand<string, "ConversationId">;
export type UserId = Brand<string, "UserId">;
export type Timestamp = Brand<Date, "Timestamp">;

// A rating can only be 0-5
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

// Helper functions for our branded types
export const createConversationId = (id: string): ConversationId => id as ConversationId;
export const createUserId = (id: string): UserId => id as UserId;
export const createTimestamp = (date: Date | string): Timestamp => 
  (typeof date === 'string' ? new Date(date) : date) as Timestamp;