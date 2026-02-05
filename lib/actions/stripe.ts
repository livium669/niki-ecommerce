'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { productTable, productVariantTable } from "@/lib/db/schemas/catalog";
import { orderTable, orderItemTable, addressTable, cartTable, cartItemTable, paymentTable } from "@/lib/db/schemas/commerce";
import { eq, inArray } from "drizzle-orm";
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { validateCoupon } from './coupon';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2025-01-27.acacia', // Use latest or appropriate version
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

type CheckoutItem = {
  productVariantId: string;
  quantity: number;
};

// Helper to resolve Product ID to Variant ID (same as in cart.ts)
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

export async function createCheckoutSession(items: CheckoutItem[], couponCode?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new Error("You must be logged in to checkout.");
  }

  if (!items.length) {
    throw new Error("Cart is empty.");
  }

  // 1. Fetch real product details to prevent price tampering
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const dbItemsMap = new Map<string, any>();

  for (const item of items) {
    const variantId = await resolveVariantId(item.productVariantId);
    if (!variantId) continue;

    const variant = await db.query.productVariantTable.findFirst({
      where: eq(productVariantTable.id, variantId),
      with: {
        product: true
      }
    });

    if (variant) {
      dbItemsMap.set(variantId, variant);
      
      const price = parseFloat(variant.salePrice || variant.price);
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: variant.product.name,
            description: variant.sku, // or product description
            metadata: {
              productVariantId: variantId,
              productId: variant.productId
            }
          },
          unit_amount: Math.round(price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      });
    }
  }

  if (lineItems.length === 0) {
    throw new Error("No valid items found.");
  }

  // 2. Prepare Customer (to pre-fill address)
  let customerId: string | undefined;
  
  try {
    // 2.1 Fetch user's address from DB
    const userAddress = await db.query.addressTable.findFirst({
      where: (addresses, { and, eq }) => and(
        eq(addresses.userId, session.user.id),
        eq(addresses.type, 'shipping'),
        eq(addresses.isProfileVisible, true)
      ),
      orderBy: (addresses, { desc }) => [desc(addresses.isDefault), desc(addresses.id)]
    });

    // 2.2 Find or Create Stripe Customer
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      // Optional: Update customer address if we have one in DB
      if (userAddress) {
        await stripe.customers.update(customerId, {
          name: session.user.name,
          shipping: {
            name: session.user.name,
            address: {
              line1: userAddress.line1,
              line2: userAddress.line2 || undefined,
              city: userAddress.city,
              state: userAddress.state,
              postal_code: userAddress.postalCode,
              country: userAddress.country,
            }
          },
          address: {
             line1: userAddress.line1,
             line2: userAddress.line2 || undefined,
             city: userAddress.city,
             state: userAddress.state,
             postal_code: userAddress.postalCode,
             country: userAddress.country,
          }
        });
      }
    } else {
      const customerParams: Stripe.CustomerCreateParams = {
        email: session.user.email,
        name: session.user.name,
      };

      if (userAddress) {
        customerParams.shipping = {
          name: session.user.name,
          address: {
            line1: userAddress.line1,
            line2: userAddress.line2 || undefined,
            city: userAddress.city,
            state: userAddress.state,
            postal_code: userAddress.postalCode,
            country: userAddress.country,
          }
        };
        customerParams.address = {
            line1: userAddress.line1,
            line2: userAddress.line2 || undefined,
            city: userAddress.city,
            state: userAddress.state,
            postal_code: userAddress.postalCode,
            country: userAddress.country,
        };
      }

      const newCustomer = await stripe.customers.create(customerParams);
      customerId = newCustomer.id;
    }
  } catch (error) {
    console.error("Error managing Stripe customer:", error);
    // Continue without customer pre-fill if this fails
  }

  // 3. Prepare Coupon
  const discounts = [];
  if (couponCode) {
    const couponValidation = await validateCoupon(couponCode);
    if (couponValidation.valid && couponValidation.coupon) {
       const dbCoupon = couponValidation.coupon;
       
       try {
           const stripeCouponId = `COUPON_${dbCoupon.id}`;
           let stripeCoupon;
           
           try {
               stripeCoupon = await stripe.coupons.retrieve(stripeCouponId);
           } catch (e) {
               const stripeCouponParams: Stripe.CouponCreateParams = {
                   name: dbCoupon.code,
                   currency: 'usd',
                   duration: 'once',
                   id: stripeCouponId
               };
               
               if (dbCoupon.discountType === 'percentage') {
                   stripeCouponParams.percent_off = parseFloat(dbCoupon.discountValue);
               } else {
                   stripeCouponParams.amount_off = Math.round(parseFloat(dbCoupon.discountValue) * 100);
               }

               stripeCoupon = await stripe.coupons.create(stripeCouponParams);
           }
           
           discounts.push({ coupon: stripeCoupon.id });
       } catch (error) {
           console.error("Error applying coupon to Stripe:", error);
           throw new Error("Failed to apply coupon.");
       }
    } else {
        throw new Error(couponValidation.message || "Invalid coupon");
    }
  }

  // 4. Create Stripe Session
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/checkout`,
    metadata: {
      userId: session.user.id,
    },
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'ES', 'FR', 'DE'],
    },
    billing_address_collection: 'required',
    discounts: discounts.length > 0 ? discounts : undefined,
  };

  if (customerId) {
    sessionParams.customer = customerId;
    sessionParams.customer_update = {
      address: 'auto',
      shipping: 'auto',
    };
  } else {
    sessionParams.customer_email = session.user.email;
  }

  const stripeSession = await stripe.checkout.sessions.create(sessionParams);

  return { url: stripeSession.url };
}

export async function handleCheckoutSuccess(sessionId: string) {
  if (!sessionId) return { success: false, error: "No session ID" };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return { success: false, error: "Payment not successful" };
    }

    const userId = session.metadata?.userId;
    if (!userId) return { success: false, error: "No user ID in session" };

    // Check if order already exists (idempotency)
    // We can use transaction ID or payment intent ID to check
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;

    if (paymentIntentId) {
      const existingPayment = await db.query.paymentTable.findFirst({
        where: eq(paymentTable.transactionId, paymentIntentId)
      });
      if (existingPayment) {
        return { success: true, orderId: existingPayment.orderId };
      }
    }

    // 1. Create Addresses
    const shippingDetails = session.shipping_details;
    const customerDetails = session.customer_details;

    const shippingAddressId = uuidv4();
    const billingAddressId = uuidv4();

    // Use transaction to ensure atomicity
    // For now, sequential inserts as simpler implementation
    
    // Save Shipping Address
    if (shippingDetails?.address) {
      await db.insert(addressTable).values({
        id: shippingAddressId,
        userId: userId,
        type: 'shipping',
        line1: shippingDetails.address.line1 || '',
        line2: shippingDetails.address.line2 || '',
        city: shippingDetails.address.city || '',
        state: shippingDetails.address.state || '',
        country: shippingDetails.address.country || '',
        postalCode: shippingDetails.address.postal_code || '',
        isDefault: false,
        isProfileVisible: false,
      });
    }

    // Save Billing Address (fallback to shipping if same, or use customer details)
    // Stripe separates them if billing_address_collection is required
    // But getting billing address from session object can be tricky depending on API version
    // We'll use customer_details address as billing fallback or shipping as billing
    const billingAddress = customerDetails?.address || shippingDetails?.address;
    
    await db.insert(addressTable).values({
      id: billingAddressId,
      userId: userId,
      type: 'billing',
      line1: billingAddress?.line1 || '',
      line2: billingAddress?.line2 || '',
      city: billingAddress?.city || '',
      state: billingAddress?.state || '',
      country: billingAddress?.country || '',
      postalCode: billingAddress?.postal_code || '',
      isDefault: false,
      isProfileVisible: false,
    });

    // 2. Create Order
    const orderId = uuidv4();
    const totalAmount = (session.amount_total || 0) / 100;

    await db.insert(orderTable).values({
      id: orderId,
      userId: userId,
      status: 'paid',
      totalAmount: totalAmount.toString(),
      shippingAddressId: shippingAddressId,
      billingAddressId: billingAddressId,
    });

    // 3. Create Order Items
    // We need to map Stripe line items back to our DB variants
    // But Stripe session line items might not have the metadata readily available in 'expand' depending on config
    // Better: Re-fetch or trust that we can map them.
    // Actually, we can just clear the cart and assume the order matches the cart?
    // NO. The user might have changed the cart in another tab.
    // We should use the line items from Stripe session to be accurate to what was paid.
    
    // Stripe line items contain price.product which is the Stripe Product ID.
    // We stored our variant ID in price_data.product_data.metadata when creating session?
    // Actually, we put it in product_data.metadata.
    // Let's retrieve line items with product expansion.
    
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
        expand: ['data.price.product']
    });

    for (const item of lineItems.data) {
        // @ts-ignore
        const metadata = item.price?.product?.metadata;
        const variantId = metadata?.productVariantId;
        
        if (variantId) {
             await db.insert(orderItemTable).values({
                id: uuidv4(),
                orderId: orderId,
                productVariantId: variantId,
                quantity: item.quantity || 1,
                priceAtPurchase: ((item.amount_total / (item.quantity || 1)) / 100).toString()
             });
             
             // Update Stock
             // ... logic to decrement stock ...
        }
    }

    // 4. Create Payment Record
    if (paymentIntentId) {
        await db.insert(paymentTable).values({
            id: uuidv4(),
            orderId: orderId,
            method: 'stripe',
            status: 'completed',
            transactionId: paymentIntentId,
            paidAt: new Date(),
        });
    }

    // 5. Clear Cart
    const cart = await db.query.cartTable.findFirst({
        where: eq(cartTable.userId, userId)
    });
    if (cart) {
        await db.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
    }

    return { success: true, orderId };

  } catch (error: any) {
    console.error("Checkout success error:", error);
    return { success: false, error: error.message };
  }
}
