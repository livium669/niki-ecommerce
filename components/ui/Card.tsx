"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../CartContext';
import WishlistButton from '../products/WishlistButton';

interface CardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    category: { name: string };
    price: number;
    image: string;
  };
  isInWishlist?: boolean;
}

const Card: React.FC<CardProps> = ({ product, isInWishlist = false }) => {
  const { addItem, openCart } = useCart();

  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  // Helper to adapt for cart
  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if clicking the button
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      category: product.category.name,
      price: formattedPrice,
      image: product.image,
    });
    openCart();
  };

  return (
    <div className="group relative block">
      <div className="aspect-[4/5] overflow-hidden bg-zinc-900 rounded-2xl relative">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image 
            src={product.image} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
          />
        </Link>
          
        <div className="absolute top-4 right-4 z-20">
          <WishlistButton productId={product.id} initialIsActive={isInWishlist} />
        </div>

        {/* Add to cart button overlay */}
         <div
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center pointer-events-none"
        >
           <button
            onClick={addToCart}
            className="pointer-events-auto bg-white text-black px-6 py-3 uppercase font-bold tracking-widest text-xs hover:bg-zinc-200 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <Link href={`/products/${product.slug}`} className="block mt-6 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold tracking-tight uppercase">{product.name}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{product.category.name}</p>
        </div>
        <span className="text-lg font-light">{formattedPrice}</span>
      </Link>
    </div>
  );
};

export default Card;
