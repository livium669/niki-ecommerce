
import React from 'react';
import Image from 'next/image';
import { getAdminProducts } from '@/lib/actions/admin';
import Link from 'next/link';
import Pagination from '@/components/ui/Pagination';

export const metadata = {
  title: 'Products Management | Niki Admin',
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? Number(params.page) : 1;
  const { data: products, totalPages } = await getAdminProducts({ page });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Products</h1>
          <p className="text-zinc-400">Manage your product catalog.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="bg-white text-black px-6 py-3 font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors"
        >
          Add New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group bg-zinc-900/30 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-colors">
            <div className="aspect-[4/5] bg-zinc-800 relative overflow-hidden">
              {product.image ? (
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
              )}
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                {product.isPublished ? <span className="text-green-400">Published</span> : <span className="text-zinc-400">Draft</span>}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold uppercase tracking-tight line-clamp-1">{product.name}</h3>
                <span className="text-sm font-light">
                  {product.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price) : '-'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">{product.category}</p>
              <div className="flex justify-between items-center pt-2 text-xs text-zinc-400">
                <span>Stock: {product.stock || 0}</span>
                <Link href={`/admin/products/${product.id}`} className="hover:text-white underline">Edit</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
