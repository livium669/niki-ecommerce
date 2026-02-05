'use server'

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { reviewTable } from "@/lib/db/schemas/commerce";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import { reviewSchema } from "@/lib/validators";

export async function addReview(prevState: any, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return { error: "You must be logged in to leave a review." };
    }

    const validatedFields = reviewSchema.safeParse({
        productId: formData.get('productId'),
        rating: Number(formData.get('rating')),
        comment: formData.get('comment'),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.errors[0].message };
    }

    const { productId, rating, comment } = validatedFields.data;

    try {
        await db.insert(reviewTable).values({
            id: uuidv4(),
            productId,
            userId: session.user.id,
            rating,
            comment,
        });

        revalidatePath(`/products`); 
        // Revalidating /products is safe, but ideally we want to revalidate the specific product page.
        // Since we don't have the slug here easily (unless we pass it), this might be sufficient if the page fetches fresh data.
        // Or we can rely on client router.refresh() if needed.
        
        return { success: true };
    } catch (error) {
        console.error("Failed to add review:", error);
        return { error: "Failed to submit review. Please try again." };
    }
}
