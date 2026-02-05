'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { cartTable, cartItemTable } from "@/lib/db/schemas/commerce";
import { productTable, productVariantTable } from "@/lib/db/schemas/catalog";
import { eq, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export type CartItemDTO = {
  productVariantId: string;
  quantity: number;
};

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// Helper to handle frontend sending Product ID instead of Variant ID
async function resolveVariantId(id: string): Promise<string | null> {
  // 1. Check if it's a valid variant ID
  const variant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.id, id),
    columns: { id: true }
  });
  if (variant) return id;

  // 2. Check if it's a product ID
  const product = await db.query.productTable.findFirst({
    where: eq(productTable.id, id),
    with: {
      variants: {
        limit: 1,
        orderBy: (variants, { desc }) => [desc(variants.createdAt)]
      }
    }
  });

  if (product && product.variants.length > 0) {
    return product.variants[0].id;
  }

  return null;
}

export async function getCart(): Promise<CartItemDTO[]> {
  const user = await getUser();
  if (!user) return [];

  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, user.id),
    with: {
      items: {
        with: {
          variant: true
        }
      }
    }
  });

  if (!cart) return [];

  return cart.items.map(item => ({
    // Return Product ID to frontend because it expects it to match Mock Data
    productVariantId: item.variant?.productId || item.productVariantId,
    quantity: item.quantity
  }));
}

export async function syncCart(localItems: CartItemDTO[]): Promise<CartItemDTO[]> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized: User session not found during sync");
  }

  // 1. Get or create cart
  let cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, user.id)
  });

  if (!cart) {
    const [newCart] = await db.insert(cartTable).values({
      id: uuidv4(),
      userId: user.id,
    }).returning();
    cart = newCart;
  }

  // 2. Get existing DB items
  const dbItems = await db.query.cartItemTable.findMany({
    where: eq(cartItemTable.cartId, cart.id)
  });

  // 3. Merge logic
  // Map productVariantId -> quantity
  const mergedMap = new Map<string, number>();

  // Add DB items
  for (const item of dbItems) {
    mergedMap.set(item.productVariantId, item.quantity);
  }

  // Add/Merge local items with ID resolution
  for (const item of localItems) {
    const resolvedId = await resolveVariantId(item.productVariantId);
    if (!resolvedId) {
      console.warn(`[syncCart] Skipping invalid ID: ${item.productVariantId}`);
      continue;
    }
    
    const existingQty = mergedMap.get(resolvedId) || 0;
    // We can choose to sum them or take the max, or overwrite.
    // Standard behavior often sums them if they are from anonymous session + logged in session.
    mergedMap.set(resolvedId, existingQty + item.quantity);
  }

  // 4. Update DB
  // If localItems is empty, we don't need to write anything back to DB, just return DB items.
  if (localItems.length === 0) {
    // Map DB items to Product IDs for return
    const dbVariantIds = dbItems.map(i => i.productVariantId);
    if (dbVariantIds.length === 0) return [];
    
    const variants = await db.query.productVariantTable.findMany({
      where: inArray(productVariantTable.id, dbVariantIds),
      columns: { id: true, productId: true }
    });
    const vMap = new Map(variants.map(v => [v.id, v.productId]));
    
    return dbItems.map(i => ({
      productVariantId: vMap.get(i.productVariantId) || i.productVariantId,
      quantity: i.quantity
    }));
  }

  await db.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));

  const newItemsToInsert = Array.from(mergedMap.entries()).map(([variantId, qty]) => ({
    id: uuidv4(),
    cartId: cart!.id,
    productVariantId: variantId,
    quantity: qty
  }));

  if (newItemsToInsert.length > 0) {
    await db.insert(cartItemTable).values(newItemsToInsert);
  }

  // Fetch Product IDs for the inserted variants to return to client
  const insertedVariantIds = newItemsToInsert.map(i => i.productVariantId);
  const variants = await db.query.productVariantTable.findMany({
    where: inArray(productVariantTable.id, insertedVariantIds),
    columns: { id: true, productId: true }
  });
  const vMap = new Map(variants.map(v => [v.id, v.productId]));

  return newItemsToInsert.map(i => ({
    productVariantId: vMap.get(i.productVariantId) || i.productVariantId,
    quantity: i.quantity
  }));
}

export async function updateCartItem(variantId: string, quantity: number) {
  const user = await getUser();
  if (!user) return;

  const resolvedId = await resolveVariantId(variantId);
  if (!resolvedId) {
    console.warn(`[updateCartItem] Skipping invalid ID: ${variantId}`);
    return;
  }

  let cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, user.id)
  });

  if (!cart) {
    // Ensure cart exists before adding items
    const [newCart] = await db.insert(cartTable).values({
      id: uuidv4(),
      userId: user.id,
    }).returning();
    cart = newCart;
  }

  if (quantity <= 0) {
    await db.delete(cartItemTable).where(
      and(
        eq(cartItemTable.cartId, cart.id),
        eq(cartItemTable.productVariantId, resolvedId)
      )
    );
  } else {
    // Check if exists
    const existing = await db.query.cartItemTable.findFirst({
      where: and(
        eq(cartItemTable.cartId, cart.id),
        eq(cartItemTable.productVariantId, resolvedId)
      )
    });

    if (existing) {
      await db.update(cartItemTable)
        .set({ quantity })
        .where(eq(cartItemTable.id, existing.id));
    } else {
      await db.insert(cartItemTable).values({
        id: uuidv4(),
        cartId: cart.id,
        productVariantId: resolvedId,
        quantity
      });
    }
  }
}

export async function clearCart() {
  const user = await getUser();
  if (!user) return;

  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, user.id)
  });

  if (cart) {
    await db.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
  }
}
