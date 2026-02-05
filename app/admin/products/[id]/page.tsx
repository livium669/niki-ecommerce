
import React from 'react';
import { getProductById, updateProduct } from '@/lib/actions/product-admin-edit';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Product | Niki Admin',
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return <div>Product not found</div>;
  }

  // Get default variant or first variant
  const defaultVariant = product.variants.find(v => v.id === product.defaultVariantId) || product.variants[0];
  const primaryImage = product.images.find(i => i.isPrimary) || product.images[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-zinc-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Edit Product</h1>
          <p className="text-zinc-400">Update product details.</p>
        </div>
      </div>

      <form action={updateProduct} className="space-y-8 bg-zinc-900/30 border border-white/10 p-8 rounded-2xl">
        <input type="hidden" name="id" value={product.id} />
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-wide border-b border-white/10 pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Product Name</label>
              <input type="text" name="name" id="name" required defaultValue={product.name} className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Price ($)</label>
              <input type="number" name="price" id="price" required step="0.01" defaultValue={defaultVariant?.price} className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Description</label>
            <textarea name="description" id="description" rows={4} defaultValue={product.description} className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors"></textarea>
          </div>
        </div>

        {/* Stock & Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-wide border-b border-white/10 pb-2">Stock & Media</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="stock" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Stock</label>
              <input type="number" name="stock" id="stock" required min="0" defaultValue={defaultVariant?.inStock} className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" />
            </div>

            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Image URL</label>
              <input type="url" name="imageUrl" id="imageUrl" required defaultValue={primaryImage?.url} className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button type="submit" className="flex-1 bg-white text-black font-black uppercase tracking-widest py-4 rounded-lg hover:bg-zinc-200 transition-colors">
            Save Changes
          </button>
          <Link href="/admin/products" className="px-8 py-4 border border-white/20 rounded-lg font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
