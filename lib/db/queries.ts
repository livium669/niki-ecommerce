
import { db } from './client';
import { 
  productTable, categoryTable, genderTable, colorTable, sizeTable, productVariantTable, productImageTable, brandTable 
} from './schemas/catalog';
import { reviewTable, wishlistTable } from './schemas/commerce';
import { user } from './schemas/auth';
import { eq, inArray, and, gte, lte, desc, asc, sql, like, ilike, or } from 'drizzle-orm';

export type ProductFilterParams = {
  gender?: string[];
  category?: string[];
  color?: string[];
  size?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
};

export async function getProducts(params: ProductFilterParams = {}) {
  // 1. Build Base Query to fetch matching Product IDs
  let query = db.select({ id: productTable.id }).from(productTable);
  const whereClauses = [eq(productTable.isPublished, true)];

  // 2. Joins & Filters
  
  // Search
  if (params.search) {
    whereClauses.push(
      or(
        ilike(productTable.name, `%${params.search}%`),
        ilike(productTable.description, `%${params.search}%`)
      )
    );
  }

  // Category Filter
  if (params.category?.length) {
    query.innerJoin(categoryTable, eq(productTable.categoryId, categoryTable.id));
    whereClauses.push(inArray(categoryTable.slug, params.category));
  }

  // Gender Filter
  if (params.gender?.length) {
    query.innerJoin(genderTable, eq(productTable.genderId, genderTable.id));
    whereClauses.push(inArray(genderTable.slug, params.gender));
  }

  // Variant Filters (Price, Color, Size)
  if (params.color?.length || params.size?.length || params.minPrice !== undefined || params.maxPrice !== undefined) {
    query.innerJoin(productVariantTable, eq(productTable.id, productVariantTable.productId));
    
    if (params.color?.length) {
      query.innerJoin(colorTable, eq(productVariantTable.colorId, colorTable.id));
      whereClauses.push(inArray(colorTable.slug, params.color));
    }
    
    if (params.size?.length) {
      query.innerJoin(sizeTable, eq(productVariantTable.sizeId, sizeTable.id));
      whereClauses.push(inArray(sizeTable.slug, params.size));
    }

    if (params.minPrice !== undefined) {
      whereClauses.push(gte(productVariantTable.price, params.minPrice.toString()));
    }
    if (params.maxPrice !== undefined) {
      whereClauses.push(lte(productVariantTable.price, params.maxPrice.toString()));
    }
  }

  // 3. Execute ID Fetch
  const matchingIds = await query.where(and(...whereClauses)).groupBy(productTable.id);
  
  if (matchingIds.length === 0) return [];

  const productIds = matchingIds.map(r => r.id);

  // 4. Fetch Full Details
  const products = await db.query.productTable.findMany({
    where: inArray(productTable.id, productIds),
    with: {
      category: true,
      gender: true,
      brand: true,
      images: true,
      variants: {
        with: {
          color: true,
          size: true
        }
      }
    }
  });

  // 5. Process & Sort
  let processedProducts = products.map(p => {
    const prices = p.variants.map(v => Number(v.price));
    const minP = prices.length ? Math.min(...prices) : 0;
    const maxP = prices.length ? Math.max(...prices) : 0;
    const primaryImage = p.images.find(img => img.isPrimary) || p.images[0];
    
    return {
      ...p,
      price: minP,
      maxPrice: maxP,
      image: primaryImage?.url || '/placeholder.png'
    };
  });

  if (params.sort) {
    if (params.sort === 'price-asc') {
      processedProducts.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price-desc') {
      processedProducts.sort((a, b) => b.price - a.price);
    } else if (params.sort === 'newest') {
      processedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  return processedProducts;
}

export async function getProductBySlug(slug: string) {
  const product = await db.query.productTable.findFirst({
    where: eq(productTable.slug, slug),
    with: {
      category: true,
      brand: true,
      images: true,
      variants: {
        with: {
          color: true,
          size: true
        }
      }
    }
  });

  if (!product) return null;

  const prices = product.variants.map(v => Number(v.price));
  const minP = prices.length ? Math.min(...prices) : 0;
  const maxP = prices.length ? Math.max(...prices) : 0;

  return {
    ...product,
    minPrice: minP,
    maxPrice: maxP
  };
}

export async function getProductReviews(productId: string) {
  return await db.select({
    id: reviewTable.id,
    rating: reviewTable.rating,
    comment: reviewTable.comment,
    createdAt: reviewTable.createdAt,
    user: {
      name: user.name,
      image: user.image,
    }
  })
  .from(reviewTable)
  .leftJoin(user, eq(reviewTable.userId, user.id))
  .where(eq(reviewTable.productId, productId))
  .orderBy(desc(reviewTable.createdAt));
}

export async function getProductRating(productId: string) {
  const result = await db.select({
    count: sql<number>`count(*)`,
    average: sql<string>`avg(${reviewTable.rating})`,
  })
  .from(reviewTable)
  .where(eq(reviewTable.productId, productId));
  
  return {
    count: Number(result[0]?.count) || 0,
    average: Number(result[0]?.average) || 0,
  };
}

export async function getUserWishlist(userId: string) {
  const wishlistItems = await db.select({
    addedAt: wishlistTable.addedAt,
    product: {
      id: productTable.id,
      name: productTable.name,
      slug: productTable.slug,
      description: productTable.description,
      isPublished: productTable.isPublished,
      createdAt: productTable.createdAt,
    }
  })
  .from(wishlistTable)
  .innerJoin(productTable, eq(wishlistTable.productId, productTable.id))
  .where(eq(wishlistTable.userId, userId))
  .orderBy(desc(wishlistTable.addedAt));

  if (wishlistItems.length === 0) return [];

  const productIds = wishlistItems.map(item => item.product.id);
  
  const products = await db.query.productTable.findMany({
    where: inArray(productTable.id, productIds),
    with: {
      category: true,
      gender: true,
      brand: true,
      images: true,
      variants: {
        with: {
          color: true,
          size: true
        }
      }
    }
  });

  return products.map(p => {
    const prices = p.variants.map(v => Number(v.price));
    const minP = prices.length ? Math.min(...prices) : 0;
    const maxP = prices.length ? Math.max(...prices) : 0;
    const primaryImage = p.images.find(img => img.isPrimary) || p.images[0];
    
    return {
      ...p,
      price: minP,
      maxPrice: maxP,
      image: primaryImage?.url || '/placeholder.png'
    };
  });
}

export async function checkInWishlist(userId: string, productId: string) {
  const result = await db.select({ id: wishlistTable.id })
    .from(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)))
    .limit(1);
    
  return result.length > 0;
}

export async function getUserWishlistIds(userId: string) {
  const result = await db.select({ productId: wishlistTable.productId })
    .from(wishlistTable)
    .where(eq(wishlistTable.userId, userId));
    
  return result.map(r => r.productId);
}
