// Schema for PostgreSQL database with Drizzle ORM

import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
const tablePrefix = "askLou-prototype_";

// Add this to your schema.ts file
export const aiConversations = pgTable(
  `${tablePrefix}ai_conversations`,
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    prompt: text("prompt").notNull(),
    response: text("response").notNull(),
    feedback: text("feedback"),
    rating: serial("rating"),
    timestamp: timestamp("timestamp").defaultNow(),
    metadata: text("metadata"), // Can store JSON stringified data about the conversation
  },
  (table) => ({
    userIdIndex: index("user_id_idx").on(table.userId),
  })
);