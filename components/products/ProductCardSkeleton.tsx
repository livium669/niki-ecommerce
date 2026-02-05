import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="group relative block">
      {/* Image Container */}
      <div className="aspect-[4/5] overflow-hidden bg-zinc-900 rounded-2xl relative">
        <Skeleton className="w-full h-full bg-zinc-800" />
      </div>
      
      {/* Content */}
      <div className="mt-6 flex justify-between items-start">
        <div className="flex-1 space-y-2">
          {/* Title */}
          <Skeleton className="h-6 w-3/4 bg-zinc-800" />
          {/* Category */}
          <Skeleton className="h-4 w-1/2 bg-zinc-800" />
        </div>
        {/* Price */}
        <Skeleton className="h-6 w-20 bg-zinc-800 ml-4" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
