import { pgTable, uuid, text, boolean, timestamp, numeric, integer, jsonb, varchar, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

export const genderTable = pgTable('genders', {
  id: uuid('id').primaryKey().notNull(),
  label: text('label').notNull(),
  slug: text('slug').notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('genders_slug_idx').on(t.slug),
}));

export const brandTable = pgTable('brands', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  logoUrl: text('logo_url'),
}, (t) => ({
  slugIdx: uniqueIndex('brands_slug_idx').on(t.slug),
}));

export const categoryTable = pgTable('categories', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  parentId: uuid('parent_id'),
}, (t) => ({
  slugIdx: uniqueIndex('categories_slug_idx').on(t.slug),
}));

export const colorTable = pgTable('colors', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  hexCode: varchar('hex_code', { length: 7 }).notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('colors_slug_idx').on(t.slug),
}));

export const sizeTable = pgTable('sizes', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  sortOrder: integer('sort_order').notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('sizes_slug_idx').on(t.slug),
}));

export const productTable = pgTable('products', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description').notNull(),
  categoryId: uuid('category_id').notNull(),
  genderId: uuid('gender_id').notNull(),
  brandId: uuid('brand_id').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  defaultVariantId: uuid('default_variant_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('products_slug_idx').on(t.slug),
}));

export const productVariantTable = pgTable('product_variants', {
  id: uuid('id').primaryKey().notNull(),
  productId: uuid('product_id').notNull(),
  sku: text('sku').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  colorId: uuid('color_id').notNull(),
  sizeId: uuid('size_id').notNull(),
  inStock: integer('in_stock').notNull(),
  weight: numeric('weight', { precision: 10, scale: 2 }).notNull(),
  dimensions: jsonb('dimensions').$type<{ length: number; width: number; height: number }>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (t) => ({
  skuIdx: uniqueIndex('variants_sku_idx').on(t.sku),
}));

export const variantRelations = relations(productVariantTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productVariantTable.productId],
    references: [productTable.id],
  }),
  color: one(colorTable, {
    fields: [productVariantTable.colorId],
    references: [colorTable.id],
  }),
  size: one(sizeTable, {
    fields: [productVariantTable.sizeId],
    references: [sizeTable.id],
  }),
}));

export const productImageTable = pgTable('product_images', {
  id: uuid('id').primaryKey().notNull(),
  productId: uuid('product_id').notNull(),
  variantId: uuid('variant_id'),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
});

export const imageRelations = relations(productImageTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productImageTable.productId],
    references: [productTable.id],
  }),
  variant: one(productVariantTable, {
    fields: [productImageTable.variantId],
    references: [productVariantTable.id],
  }),
}));

export const collectionTable = pgTable('collections', {
  id: uuid('id').primaryKey().notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('collections_slug_idx').on(t.slug),
}));

export const productCollectionTable = pgTable('product_collections', {
  id: uuid('id').primaryKey().notNull(),
  productId: uuid('product_id').notNull(),
  collectionId: uuid('collection_id').notNull(),
});

export const collectionRelations = relations(collectionTable, ({ many }) => ({
  products: many(productCollectionTable),
}));

export const productCollectionRelations = relations(productCollectionTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productCollectionTable.productId],
    references: [productTable.id],
  }),
  collection: one(collectionTable, {
    fields: [productCollectionTable.collectionId],
    references: [collectionTable.id],
  }),
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
  category: one(categoryTable, {
    fields: [productTable.categoryId],
    references: [categoryTable.id],
  }),
  gender: one(genderTable, {
    fields: [productTable.genderId],
    references: [genderTable.id],
  }),
  brand: one(brandTable, {
    fields: [productTable.brandId],
    references: [brandTable.id],
  }),
  variants: many(productVariantTable),
  images: many(productImageTable),
  collections: many(productCollectionTable),
}));

export const addressTypeEnum = pgEnum('address_type', ['billing', 'shipping']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['stripe', 'paypal', 'cod']);
export const paymentStatusEnum = pgEnum('payment_status', ['initiated', 'completed', 'failed']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);

export const genderZ = z.object({ id: z.string().uuid(), label: z.string(), slug: z.string() });
export const brandZ = z.object({ id: z.string().uuid(), name: z.string(), slug: z.string(), logoUrl: z.string().url().optional() });
export const categoryZ = z.object({ id: z.string().uuid(), name: z.string(), slug: z.string(), parentId: z.string().uuid().nullable().optional() });
export const colorZ = z.object({ id: z.string().uuid(), name: z.string(), slug: z.string(), hexCode: z.string().regex(/^#([0-9a-fA-F]{6})$/) });
export const sizeZ = z.object({ id: z.string().uuid(), name: z.string(), slug: z.string(), sortOrder: z.number().int() });
export const productZ = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string().uuid(),
  genderId: z.string().uuid(),
  brandId: z.string().uuid(),
  isPublished: z.boolean(),
  defaultVariantId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const variantZ = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string(),
  price: z.string(),
  salePrice: z.string().optional(),
  colorId: z.string().uuid(),
  sizeId: z.string().uuid(),
  inStock: z.number().int(),
  weight: z.string(),
  dimensions: z.object({ length: z.number(), width: z.number(), height: z.number() }),
  createdAt: z.date(),
});
export const imageZ = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  url: z.string().url(),
  sortOrder: z.number().int(),
  isPrimary: z.boolean(),
});
export const collectionZ = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
});
export const productCollectionZ = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  collectionId: z.string().uuid(),
});
