
import React from 'react';
import { getProductOptions, createProduct } from '@/lib/actions/product-admin';
import Link from 'next/link';

export const metadata = {
  title: 'Add Product | Niki Admin',
};

export default async function AddProductPage() {
  const { categories, brands, genders, colors, sizes } = await getProductOptions();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-zinc-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Add Product</h1>
          <p className="text-zinc-400">Create a new product with an initial variant.</p>
        </div>
      </div>

      <form action={createProduct} className="space-y-8 bg-zinc-900/30 border border-white/10 p-8 rounded-2xl">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-wide border-b border-white/10 pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Product Name</label>
              <input type="text" name="name" id="name" required className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" placeholder="e.g. Air Max 90" />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Price ($)</label>
              <input type="number" name="price" id="price" required step="0.01" className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Description</label>
            <textarea name="description" id="description" rows={4} className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" placeholder="Product description..."></textarea>
          </div>
        </div>

        {/* Categorization */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-wide border-b border-white/10 pb-2">Categorization</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Category</label>
              <select name="categoryId" id="categoryId" required className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors appearance-none cursor-pointer">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="brandId" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Brand</label>
              <select name="brandId" id="brandId" required className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors appearance-none cursor-pointer">
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="genderId" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Gender</label>
              <select name="genderId" id="genderId" required className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors appearance-none cursor-pointer">
                <option value="">Select Gender</option>
                {genders.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Variant Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-wide border-b border-white/10 pb-2">Variant Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="colorId" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Color</label>
              <select name="colorId" id="colorId" required className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors appearance-none cursor-pointer">
                <option value="">Select Color</option>
                {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="sizeId" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Size</label>
              <select name="sizeId" id="sizeId" required className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors appearance-none cursor-pointer">
                <option value="">Select Size</option>
                {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="stock" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Stock</label>
              <input type="number" name="stock" id="stock" required min="0" className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" placeholder="Quantity" />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-wide border-b border-white/10 pb-2">Media</h3>
          
          <div className="space-y-2">
            <label htmlFor="imageUrl" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Image URL</label>
            <input type="url" name="imageUrl" id="imageUrl" required className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 focus:border-white focus:outline-none transition-colors" placeholder="https://example.com/image.jpg" />
            <p className="text-[10px] text-zinc-500">Provide a direct link to the image file.</p>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-lg hover:bg-zinc-200 transition-colors">
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
}
