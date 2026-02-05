
import React from 'react';
import Link from 'next/link';
import { SectionProps } from '../types';
import Card from './ui/Card';
import { mockProducts } from '../lib/mock-data';

interface CollectionProps extends SectionProps {
  wishlistProductIds?: string[];
}

const Collection: React.FC<CollectionProps> = ({ id, wishlistProductIds = [] }) => {
  // Map mockProducts to match the shape expected by Card/Collection if needed
  // Card expects: id, name, slug, category: { name }, price, image
  // mockProducts has all this. mockProducts price is in cents (number). Card formats it.
  
  // We filter to show first 4 items as the original collection did
  const displayProducts = mockProducts.slice(0, 4).map(p => ({
    ...p,
    price: p.price / 100, // Convert cents to dollars if mock data is in cents
    image: p.images[0],   // Add image property for Card
    // slug is now in mockProducts
  }));

  return (
    <section id={id} className="py-16 md:py-32 bg-black px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
          <div>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-gray-500 mb-4 block">Selected Works</span>
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase">The Collection</h2>
          </div>
          <p className="max-w-sm text-gray-400 font-light text-sm md:text-base">
            Each pair is handcrafted using reclaimed carbon fiber and aerospace-grade textiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.map((product) => (
            <Card 
              key={product.id} 
              product={product} 
              isInWishlist={wishlistProductIds.includes(product.id)}
            />
          ))}
        </div>

        <div className="flex justify-end mt-12">
          <Link 
            href="/products" 
            className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-300"
          >
            View More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Collection;
