import { check, index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const places = sqliteTable("places", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  categories: text("categories").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  directions: text("directions").notNull(),
  authorId: text("author_id").notNull(),
  createdAt: integer("created_at").notNull(),
  mergedInto: integer("merged_into"),
});

export const visits = sqliteTable("visits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  placeId: integer("place_id").notNull().references(() => places.id),
  authorId: text("author_id").notNull(),
  status: text("status").notNull(),
  at: integer("at").notNull(),
}, table => [
  index("visits_place_latest").on(table.placeId, table.at, table.id),
  check("visit_status", sql`${table.status} in ('selling', 'sold_out', 'missing')`),
]);

export const flags = sqliteTable("flags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  placeId: integer("place_id").notNull().references(() => places.id),
  duplicateId: integer("duplicate_id").references(() => places.id),
  authorId: text("author_id").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes").notNull(),
  at: integer("at").notNull(),
  resolvedAt: integer("resolved_at"),
}, table => [check("flag_reason", sql`${table.reason} in ('wrong_pin', 'duplicate')`)]);
