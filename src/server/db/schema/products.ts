import { pgTable, text, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  sku: text("sku").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  updatedBy: text("updated_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
});

export const productRelations = relations(product, ({ one }) => ({
  creator: one(user, {
    fields: [product.createdBy],
    references: [user.id],
    relationName: "product_creator",
  }),
  updater: one(user, {
    fields: [product.updatedBy],
    references: [user.id],
    relationName: "product_updater",
  }),
}));

// Auto-generated types
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;

// Auto-generated Zod schemas from Drizzle
export const productSelectSchema = createSelectSchema(product);
export const productInsertSchema = createInsertSchema(product);

// Enhanced schemas with custom validation
export const createProductSchema = productInsertSchema
  .pick({
    name: true,
    description: true,
    price: true,
    sku: true,
    active: true,
  })
  .extend({
    name: z.string().min(1, "Name is required"),
    description: z.preprocess(
      (val) => (val === null || val === '' || (typeof val === 'string' && val.trim() === '')) ? null : val,
      z.string().nullable().optional()
    ),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
    sku: z.string().min(1, "SKU is required"),
    active: z.boolean().optional().default(true),
  });

export const updateProductSchema = productInsertSchema
  .pick({
    name: true,
    description: true,
    price: true,
    sku: true,
    active: true,
  })
  .extend({
    name: z.string().min(1, "Name is required").optional(),
    description: z.preprocess(
      (val) => (val === null || val === '' || (typeof val === 'string' && val.trim() === '')) ? null : val,
      z.string().nullable().optional()
    ),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number").optional(),
    sku: z.string().min(1, "SKU is required").optional(),
    active: z.boolean().optional(),
  });

