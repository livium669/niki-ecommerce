'use server';

import { db } from "@/lib/db/client";
import { couponTable } from "@/lib/db/schemas/commerce";
import { eq, and, gt, lt } from "drizzle-orm";

export async function validateCoupon(code: string) {
  if (!code) return { valid: false, message: "No code provided" };

  try {
    const coupon = await db.query.couponTable.findFirst({
      where: eq(couponTable.code, code)
    });

    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }

    // Check expiration
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, message: "Coupon has expired" };
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.maxUsage) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    return { 
      valid: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    };

  } catch (error) {
    console.error("Coupon validation error:", error);
    return { valid: false, message: "Error validating coupon" };
  }
}
