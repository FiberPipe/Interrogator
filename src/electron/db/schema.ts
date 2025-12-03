import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const knowledge = sqliteTable('knowledge', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title'),
  content: text('content'),
  createdAt: text('created_at'),
});
