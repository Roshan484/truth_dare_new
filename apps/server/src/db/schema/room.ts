import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { category } from "./category";

export const room = pgTable("room", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  limit: integer("limit").notNull().default(2),
  joinCode: text("join_code"),
  categorySlug: text("category_slug")
    .notNull()
    .references(() => category.slug, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const roomMember = pgTable("room_member", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => room.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  isHost: boolean("is_host").notNull().default(false),
});
