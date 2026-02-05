import { pgTable, uuid, text, integer, timestamp, boolean, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { addressTypeEnum, discountTypeEnum, orderStatusEnum, paymentMethodEnum, paymentStatusEnum, productTable, productVariantTable } from './catalog';
import { user } from './auth';

export const guestTable = pgTable('guests', {
  id: text('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const addressTable = pgTable('addresses', {
  id: uuid('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  type: addressTypeEnum('type').notNull(),
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  postalCode: text('postal_code').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  isProfileVisible: boolean('is_profile_visible').notNull().default(true),
});

export const addressRelations = relations(addressTable, ({ one }) => ({
  user: one(user, {
    fields: [addressTable.userId],
    references: [user.id],
  }),
}));

export const reviewTable = pgTable('reviews', {
  id: uuid('id').primaryKey().notNull(),
  productId: uuid('product_id').notNull(),
  userId: text('user_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const reviewRelations = relations(reviewTable, ({ one }) => ({
  product: one(productTable, { fields: [reviewTable.productId], references: [productTable.id] }),
  user: one(user, { fields: [reviewTable.userId], references: [user.id] }),
}));

export const cartTable = pgTable('carts', {
  id: uuid('id').primaryKey().notNull(),
  userId: text('user_id'),
  guestId: text('guest_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const cartItemTable = pgTable('cart_items', {
  id: uuid('id').primaryKey().notNull(),
  cartId: uuid('cart_id').notNull(),
  productVariantId: uuid('product_variant_id').notNull(),
  quantity: integer('quantity').notNull(),
});

export const cartItemRelations = relations(cartItemTable, ({ one }) => ({
  cart: one(cartTable, { fields: [cartItemTable.cartId], references: [cartTable.id] }),
  variant: one(productVariantTable, { fields: [cartItemTable.productVariantId], references: [productVariantTable.id] }),
}));

export const cartRelations = relations(cartTable, ({ one, many }) => ({
  user: one(user, { fields: [cartTable.userId], references: [user.id] }),
  guest: one(guestTable, { fields: [cartTable.guestId], references: [guestTable.id] }),
  items: many(cartItemTable),
}));

export const orderTable = pgTable('orders', {
  id: uuid('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  status: orderStatusEnum('status').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: uuid('shipping_address_id').notNull(),
  billingAddressId: uuid('billing_address_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const orderItemTable = pgTable('order_items', {
  id: uuid('id').primaryKey().notNull(),
  orderId: uuid('order_id').notNull(),
  productVariantId: uuid('product_variant_id').notNull(),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: numeric('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
});

export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
  order: one(orderTable, { fields: [orderItemTable.orderId], references: [orderTable.id] }),
  variant: one(productVariantTable, { fields: [orderItemTable.productVariantId], references: [productVariantTable.id] }),
}));

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  user: one(user, { fields: [orderTable.userId], references: [user.id] }),
  shippingAddress: one(addressTable, { fields: [orderTable.shippingAddressId], references: [addressTable.id] }),
  billingAddress: one(addressTable, { fields: [orderTable.billingAddressId], references: [addressTable.id] }),
  items: many(orderItemTable),
}));

export const paymentTable = pgTable('payments', {
  id: uuid('id').primaryKey().notNull(),
  orderId: uuid('order_id').notNull(),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true, mode: 'date' }),
  transactionId: text('transaction_id'),
});

export const paymentRelations = relations(paymentTable, ({ one }) => ({
  order: one(orderTable, { fields: [paymentTable.orderId], references: [orderTable.id] }),
}));

export const couponTable = pgTable('coupons', {
  id: uuid('id').primaryKey().notNull(),
  code: text('code').notNull(),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
  maxUsage: integer('max_usage').notNull(),
  usedCount: integer('used_count').notNull().default(0),
});

export const wishlistTable = pgTable('wishlists', {
  id: uuid('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  productId: uuid('product_id').notNull(),
  addedAt: timestamp('added_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const wishlistRelations = relations(wishlistTable, ({ one }) => ({
  user: one(user, { fields: [wishlistTable.userId], references: [user.id] }),
  product: one(productTable, { fields: [wishlistTable.productId], references: [productTable.id] }),
}));

export const userZ = z.object({ id: z.string(), email: z.string().email(), name: z.string().optional(), createdAt: z.date() });
export const guestZ = z.object({ id: z.string(), createdAt: z.date() });
export const addressZ = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: z.enum(['billing', 'shipping']),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  isDefault: z.boolean(),
});
export const reviewZ = z.object({ id: z.string().uuid(), productId: z.string().uuid(), userId: z.string(), rating: z.number().int().min(1).max(5), comment: z.string(), createdAt: z.date() });
export const cartZ = z.object({ id: z.string().uuid(), userId: z.string().nullable().optional(), guestId: z.string().nullable().optional(), createdAt: z.date(), updatedAt: z.date() });
export const cartItemZ = z.object({ id: z.string().uuid(), cartId: z.string().uuid(), productVariantId: z.string().uuid(), quantity: z.number().int().min(1) });
export const orderZ = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
  totalAmount: z.string(),
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid(),
  createdAt: z.date(),
});
export const orderItemZ = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number().int(),
  priceAtPurchase: z.string(),
});
export const paymentZ = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  method: z.enum(['stripe', 'paypal', 'cod']),
  status: z.enum(['initiated', 'completed', 'failed']),
  paidAt: z.date().optional(),
  transactionId: z.string().optional(),
});
export const couponZ = z.object({
  id: z.string().uuid(),
  code: z.string(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.string(),
  expiresAt: z.date().optional(),
  maxUsage: z.number().int(),
  usedCount: z.number().int(),
});
export const wishlistZ = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  productId: z.string().uuid(),
  addedAt: z.date(),
});
