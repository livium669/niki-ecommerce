
'use server';

import { db } from "@/lib/db/client";
import { orderTable, orderItemTable } from "@/lib/db/schemas/commerce";
import { productTable, productVariantTable } from "@/lib/db/schemas/catalog";
import { user } from "@/lib/db/schemas/auth";
import { sql, desc, eq, sum, count, ilike, or, and } from "drizzle-orm";

export async function getAdminDashboardStats() {
  // Total Sales (Sum of totalAmount from orders)
  const salesResult = await db.select({
    total: sql<number>`sum(${orderTable.totalAmount})`
  }).from(orderTable);

  const totalSales = Number(salesResult[0]?.total) || 0;

  // Total Orders
  const ordersResult = await db.select({
    count: count()
  }).from(orderTable);

  const totalOrders = ordersResult[0]?.count || 0;

  // Total Products
  const productsResult = await db.select({
    count: count()
  }).from(productTable);

  const totalProducts = productsResult[0]?.count || 0;

  // Recent Orders
  const recentOrders = await db.select({
    id: orderTable.id,
    totalAmount: orderTable.totalAmount,
    status: orderTable.status,
    createdAt: orderTable.createdAt,
    userEmail: sql<string>`(SELECT email FROM "user" WHERE "user".id = ${orderTable.userId})`
  })
  .from(orderTable)
  .orderBy(desc(orderTable.createdAt))
  .limit(5);

  return {
    totalSales,
    totalOrders,
    totalProducts,
    recentOrders
  };
}

export async function getAdminProducts({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) {
  const offset = (page - 1) * limit;

  const data = await db.select({
    id: productTable.id,
    name: productTable.name,
    category: sql<string>`(SELECT name FROM categories WHERE categories.id = ${productTable.categoryId})`,
    price: sql<number>`(SELECT min(price) FROM product_variants WHERE product_variants.product_id = ${productTable.id})`,
    stock: sql<number>`(SELECT sum(in_stock) FROM product_variants WHERE product_variants.product_id = ${productTable.id})`,
    isPublished: productTable.isPublished,
    image: sql<string>`(SELECT url FROM product_images WHERE product_images.product_id = ${productTable.id} LIMIT 1)`,
  })
  .from(productTable)
  .orderBy(desc(productTable.createdAt))
  .limit(limit)
  .offset(offset);

  const countResult = await db.select({ count: count() }).from(productTable);
  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalPages, currentPage: page };
}

export async function getAdminOrders({ 
  page = 1, 
  limit = 10,
  search,
  status
}: { 
  page?: number; 
  limit?: number;
  search?: string;
  status?: string;
} = {}) {
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];

  if (status && status !== 'all') {
    conditions.push(eq(orderTable.status, status as any));
  }

  if (search) {
    conditions.push(
      or(
        ilike(user.email, `%${search}%`),
        ilike(user.name, `%${search}%`),
        ilike(orderTable.id, `%${search}%`)
      )
    );
  }

  const data = await db.select({
    id: orderTable.id,
    totalAmount: orderTable.totalAmount,
    status: orderTable.status,
    createdAt: orderTable.createdAt,
    customer: user.name,
    email: user.email,
    itemsCount: sql<number>`(SELECT count(*) FROM order_items WHERE order_items.order_id = ${orderTable.id})`
  })
  .from(orderTable)
  .leftJoin(user, eq(orderTable.userId, user.id))
  .where(and(...conditions))
  .orderBy(desc(orderTable.createdAt))
  .limit(limit)
  .offset(offset);

  // Count total for pagination
  const countQuery = db.select({ count: count() })
    .from(orderTable)
    .leftJoin(user, eq(orderTable.userId, user.id))
    .where(and(...conditions));

  const countResult = await countQuery;
  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalPages, currentPage: page };
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') {
  try {
    await db.update(orderTable)
      .set({ status })
      .where(eq(orderTable.id, orderId));
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { error: "Failed to update status" };
  }
}
