
'use server';

import { db } from "@/lib/db/client";
import { productTable, productVariantTable, productImageTable, categoryTable, brandTable, genderTable, colorTable, sizeTable } from "@/lib/db/schemas/catalog";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getProductOptions() {
  const categories = await db.select().from(categoryTable);
  const brands = await db.select().from(brandTable);
  const genders = await db.select().from(genderTable);
  const colors = await db.select().from(colorTable);
  const sizes = await db.select().from(sizeTable);

  return { categories, brands, genders, colors, sizes };
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const categoryId = formData.get('categoryId') as string;
  const brandId = formData.get('brandId') as string;
  const genderId = formData.get('genderId') as string;
  const imageUrl = formData.get('imageUrl') as string;
  
  // Variant details (assuming single variant creation for MVP simplicity)
  const colorId = formData.get('colorId') as string;
  const sizeId = formData.get('sizeId') as string;
  const stock = formData.get('stock') as string;

  if (!name || !price || !categoryId || !brandId || !genderId || !imageUrl || !colorId || !sizeId) {
    return { error: "Missing required fields" };
  }

  const productId = uuidv4();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    // 1. Create Product
    await db.insert(productTable).values({
      id: productId,
      name,
      slug: `${slug}-${Date.now()}`, // Ensure unique slug
      description: description || '',
      categoryId,
      brandId,
      genderId,
      isPublished: true,
    });

    // 2. Create Variant
    const variantId = uuidv4();
    await db.insert(productVariantTable).values({
      id: variantId,
      productId,
      sku: `SKU-${Date.now()}`,
      price: price,
      colorId,
      sizeId,
      inStock: parseInt(stock) || 0,
      weight: '0',
      dimensions: { length: 0, width: 0, height: 0 }
    });

    // 3. Create Image
    await db.insert(productImageTable).values({
      id: uuidv4(),
      productId,
      variantId,
      url: imageUrl,
      isPrimary: true,
    });

    // Update default variant
    await db.update(productTable)
      .set({ defaultVariantId: variantId })
      .where(eq(productTable.id, productId));

    revalidatePath('/admin/products');
    revalidatePath('/products');
  } catch (error) {
    console.error("Failed to create product:", error);
    return { error: "Failed to create product" };
  }

  redirect('/admin/products');
}
