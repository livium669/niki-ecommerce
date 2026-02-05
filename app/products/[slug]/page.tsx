import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetail from '@/components/products/ProductDetail';
import ProductReviews from '@/components/products/ProductReviews';
import Card from '@/components/ui/Card';
import { getProductBySlug, getProductRating, checkInWishlist, getProducts, getUserWishlistIds } from '@/lib/db/queries';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const imageUrl = primaryImage ? primaryImage.url : '/placeholder.png';

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Niki`,
      description: product.description,
      url: `/products/${product.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Niki`,
      description: product.description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const { average, count } = await getProductRating(product.id);

  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isInWishlist = session?.user ? await checkInWishlist(session.user.id, product.id) : false;

  const wishlistIds = session?.user ? new Set(await getUserWishlistIds(session.user.id)) : new Set();
  
  const relatedProducts = await getProducts({
    category: [product.category.slug],
  });
  
  const recommendedProducts = relatedProducts
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        {/* Breadcrumb - simple implementation */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8">
          <a href="/products" className="hover:text-white transition-colors">Products</a>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <ProductDetail 
          product={product} 
          averageRating={average} 
          reviewCount={count}
          isInWishlist={isInWishlist}
        />
      </main>

      <ProductReviews productId={product.id} />

      {recommendedProducts.length > 0 && (
        <section className="py-20 border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedProducts.map(p => (
                <Card 
                  key={p.id} 
                  product={p} 
                  isInWishlist={wishlistIds.has(p.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
