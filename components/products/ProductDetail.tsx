"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import StarRating from './StarRating';
import WishlistButton from './WishlistButton';

interface Variant {
  id: string;
  price: number;
  salePrice: number | null;
  color: { id: string; name: string; hexCode: string; slug: string };
  size: { id: string; name: string; sortOrder: number; slug: string };
  inStock: number;
}

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  variantId: string | null;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    description: string;
    category: { name: string; slug: string };
    brand: { name: string };
    variants: Variant[];
    images: ProductImage[];
    minPrice: number;
    maxPrice: number;
  };
  averageRating?: number;
  reviewCount?: number;
  isInWishlist?: boolean;
}

export default function ProductDetail({ product, averageRating = 0, reviewCount = 0, isInWishlist = false }: ProductDetailProps) {
  const { addItem, openCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(product.images.find(i => i.isPrimary)?.url || product.images[0]?.url);

  // Get unique colors and sizes from variants
  const colors = useMemo(() => {
    const unique = new Map();
    product.variants.forEach(v => {
      if (!unique.has(v.color.id)) {
        unique.set(v.color.id, v.color);
      }
    });
    return Array.from(unique.values());
  }, [product.variants]);

  const sizes = useMemo(() => {
    const unique = new Map();
    product.variants.forEach(v => {
      if (!unique.has(v.size.id)) {
        unique.set(v.size.id, v.size);
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [product.variants]);

  // Set default selections
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0].id);
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0].id);
  }, [colors, sizes, selectedColor, selectedSize]);

  // Find selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find(v => v.color.id === selectedColor && v.size.id === selectedSize);
  }, [product.variants, selectedColor, selectedSize]);

  // Update image when color changes (if there are variant-specific images)
  useEffect(() => {
    if (selectedVariant) {
      const variantImage = product.images.find(i => i.variantId === selectedVariant.id);
      if (variantImage) {
        setCurrentImage(variantImage.url);
      }
    }
  }, [selectedVariant, product.images]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      id: selectedVariant.id, // Use variant ID for cart
      name: `${product.name} - ${selectedVariant.color.name} / ${selectedVariant.size.name}`,
      category: product.category.name,
      price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedVariant.price),
      image: currentImage,
    });
    openCart();
  };

  const isOutOfStock = selectedVariant ? selectedVariant.inStock <= 0 : false;
  const displayPrice = selectedVariant ? selectedVariant.price : product.minPrice;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Image Gallery */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 h-fit lg:sticky lg:top-32">
        {/* Thumbnails */}
        <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:w-24 lg:max-h-[600px] no-scrollbar">
          {product.images.map((img) => (
            <button 
              key={img.id}
              onClick={() => setCurrentImage(img.url)}
              className={`flex-shrink-0 w-20 lg:w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors relative ${currentImage === img.url ? 'border-white' : 'border-transparent'}`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="flex-1 aspect-square bg-zinc-900 rounded-2xl overflow-hidden relative">
           <Image 
            src={currentImage} 
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <p className="text-zinc-400 text-xs md:text-sm uppercase tracking-widest font-bold mb-2">{product.brand.name} • {product.category.name}</p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={Math.round(averageRating)} size="sm" />
            <a href="#reviews" className="text-xs md:text-sm text-zinc-400 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-4">
              {reviewCount} reviews
            </a>
          </div>

          <p className="text-xl md:text-2xl font-light">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(displayPrice)}
          </p>
        </div>

        <div className="space-y-8 flex-1">
          {/* Color Selector */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Color</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${selectedColor === color.id ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                >
                  {selectedColor === color.id && <span className="sr-only">Selected</span>}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Selected: <span className="text-white">{colors.find(c => c.id === selectedColor)?.name}</span>
            </p>
          </div>

          {/* Size Selector */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Size</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sizes.map((size) => {
                // Check availability for this size with selected color
                const isAvailable = product.variants.some(v => 
                  v.size.id === size.id && 
                  (selectedColor ? v.color.id === selectedColor : true) &&
                  v.inStock > 0
                );

                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    disabled={!isAvailable}
                    className={`
                      py-3 rounded-lg text-sm font-bold border transition-all
                      ${selectedSize === size.id 
                        ? 'bg-white text-black border-white' 
                        : isAvailable 
                          ? 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-600' 
                          : 'bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed decoration-slice'}
                    `}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert prose-sm max-w-none">
            <p>{product.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || isOutOfStock}
            className={`
              flex-1 py-4 px-8 font-black uppercase tracking-widest text-sm
              transition-all duration-300
              ${!selectedVariant || isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200'}
            `}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          
          <div className="w-14 flex items-center justify-center border border-white/20 hover:border-white transition-colors">
            <WishlistButton productId={product.id} initialIsActive={isInWishlist} />
          </div>
        </div>
      </div>
    </div>
  );
}
