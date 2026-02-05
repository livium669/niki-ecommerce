import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Filters from '@/components/products/Filters';
import Sort from '@/components/products/Sort';
import SearchBar from '@/components/products/SearchBar';
import ProductGrid from '@/components/products/ProductGrid';
import ProductGridSkeleton from '@/components/products/ProductGridSkeleton';

export const metadata = {
  title: 'Products',
  description: 'Explore our latest collection of premium footwear.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Extract params
  const genderParam = typeof params.gender === 'string' ? params.gender.split(',') : undefined;
  const categoryParam = typeof params.category === 'string' ? params.category.split(',') : undefined;
  const colorParam = typeof params.color === 'string' ? params.color.split(',') : undefined;
  const sizeParam = typeof params.size === 'string' ? params.size.split(',') : undefined;
  const sortParam = typeof params.sort === 'string' ? params.sort : 'featured';
  const searchParam = typeof params.search === 'string' ? params.search : undefined;
  
  // Parse price
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  if (params.price) {
    const ranges = (typeof params.price === 'string' ? params.price : params.price[0]).split(',');
    let globalMin = Infinity;
    let globalMax = -Infinity;
    
    for (const range of ranges) {
      const [minStr, maxStr] = range.split('-');
      const min = minStr ? Number(minStr) : 0;
      const max = maxStr ? Number(maxStr) : Infinity;
      
      if (min < globalMin) globalMin = min;
      if (max > globalMax) globalMax = max;
    }
    
    if (globalMin !== Infinity) minPrice = globalMin;
    if (globalMax !== -Infinity && globalMax !== Infinity) maxPrice = globalMax;
  }

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="flex flex-col gap-6 w-full md:w-auto">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
                All Products
              </h1>
              <p className="text-zinc-400 max-w-md font-light">
                Performance engineered for the modern athlete. Designed for motion.
              </p>
            </div>
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
          <div className="mt-8 md:mt-0">
            <Sort />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Suspense>
              <Filters />
            </Suspense>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <Suspense key={JSON.stringify(params)} fallback={<ProductGridSkeleton />}>
              <ProductGrid 
                category={categoryParam}
                gender={genderParam}
                color={colorParam}
                size={sizeParam}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sort={sortParam}
                search={searchParam}
              />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
