import './load-env';
import { db } from '../lib/db/client';
import { couponTable } from '../lib/db/schemas/commerce';
import { v4 as uuidv4 } from 'uuid';

async function createCoupon() {
  try {
    const code = process.argv[2] || "WELCOME10";
    const discountValue = process.argv[3] || "10";
    const type = (process.argv[4] === "fixed" ? "fixed" : "percentage") as "fixed" | "percentage";

    console.log(`Creating coupon: ${code} - ${discountValue} ${type}`);

    // Check if coupon already exists
    const existingCoupon = await db.query.couponTable.findFirst({
        where: (coupons, { eq }) => eq(coupons.code, code)
    });

    if (existingCoupon) {
        console.log(`Coupon ${code} already exists.`);
        process.exit(0);
    }

    await db.insert(couponTable).values({
      id: uuidv4(),
      code: code,
      discountType: type,
      discountValue: discountValue,
      maxUsage: 100,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    });

    console.log("Coupon created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating coupon:", error);
    process.exit(1);
  }
}

createCoupon();
