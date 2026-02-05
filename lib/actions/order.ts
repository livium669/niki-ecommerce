'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { productVariantTable } from "@/lib/db/schemas/catalog";
import { cartTable, cartItemTable, orderTable } from "@/lib/db/schemas/commerce";
import { eq, sql } from "drizzle-orm";

export async function placeOrder(items: { productVariantId: string; quantity: number }[]) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Note: In a real app, we should use a transaction here.
  // db.transaction(...)
  
  // 1. Validate and Decrement Stock
  for (const item of items) {
    // Check if product exists in DB
    const variant = await db.query.productVariantTable.findFirst({
        where: eq(productVariantTable.id, item.productVariantId)
    });

    if (variant) {
        if (variant.inStock < item.quantity) {
            throw new Error(`Not enough stock for product ID: ${item.productVariantId}`);
        }
        
        // Decrement
        await db.update(productVariantTable)
            .set({ inStock: sql`${productVariantTable.inStock} - ${item.quantity}` })
            .where(eq(productVariantTable.id, item.productVariantId));
    } else {
        // If product is not in DB (mock data), we skip DB decrement.
        // But we should probably log it or handle it.
        console.warn(`Product ${item.productVariantId} not found in DB, skipping stock decrement.`);
    }
  }

  // 2. Clear User's Cart in DB
  if (session?.user) {
    const cart = await db.query.cartTable.findFirst({
        where: eq(cartTable.userId, session.user.id)
    });
    if (cart) {
        await db.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
    }
  }

  return { success: true };
}

export async function getUserOrders() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return [];

  const orders = await db.query.orderTable.findMany({
    where: eq(orderTable.userId, session.user.id),
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    with: {
      items: {
        with: {
          variant: {
            with: {
              product: true
            }
          }
        }
      }
    }
  });
  
  return orders;
}
