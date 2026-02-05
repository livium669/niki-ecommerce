'use server';

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { wishlistTable } from "@/lib/db/schemas/commerce";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from "drizzle-orm";

export async function toggleWishlist(productId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { error: "You must be logged in to add to wishlist." };
  }

  try {
    const existing = await db.select()
      .from(wishlistTable)
      .where(
        and(
          eq(wishlistTable.userId, session.user.id),
          eq(wishlistTable.productId, productId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Remove
      await db.delete(wishlistTable)
        .where(
          and(
            eq(wishlistTable.userId, session.user.id),
            eq(wishlistTable.productId, productId)
          )
        );
      revalidatePath('/wishlist');
      revalidatePath(`/products`);
      return { success: true, action: 'removed' };
    } else {
      // Add
      await db.insert(wishlistTable).values({
        id: uuidv4(),
        userId: session.user.id,
        productId,
      });
      revalidatePath('/wishlist');
      revalidatePath(`/products`);
      return { success: true, action: 'added' };
    }
  } catch (error) {
    console.error("Failed to toggle wishlist:", error);
    return { error: "Failed to update wishlist. Please try again." };
  }
}
