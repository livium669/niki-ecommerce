import React from 'react';
import Card from '@/components/ui/Card';
import { getProducts, getUserWishlistIds } from '@/lib/db/queries';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface ProductGridProps {
  category?: string[];
  gender?: string[];
  color?: string[];
  size?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort: string;
  search?: string;
}

export default async function ProductGrid({
  category,
  gender,
  color,
  size,
  minPrice,
  maxPrice,
  sort,
  search
}: ProductGridProps) {
  // Get user session for wishlist
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const wishlistIds = session?.user ? new Set(await getUserWishlistIds(session.user.id)) : new Set();

  // Fetch products
  const products = await getProducts({
    category,
    gender,
    color,
    size,
    minPrice,
    maxPrice,
    sort,
    search,
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-bold uppercase mb-2">No results found</h3>
        <p className="text-zinc-400">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
      {products.map((product) => (
        <Card 
          key={product.id} 
          product={product} 
          isInWishlist={wishlistIds.has(product.id)}
        />
      ))}
    </div>
  );
}
