import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { category } from "./category";

export const question = pgTable("question", {
  id: text("id").primaryKey(),
  categorySlug: text("category_slug")
    .notNull()
    .references(() => category.slug, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
