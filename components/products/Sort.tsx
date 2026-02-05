"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formUrlQuery } from '@/lib/utils/query';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low - High' },
  { value: 'price-desc', label: 'Price: High - Low' },
];

export default function Sort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'featured';

  const handleSortChange = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      updates: {
        sort: value,
      },
      baseUrl: window.location.pathname,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-zinc-500 uppercase tracking-widest hidden sm:inline-block">Sort By:</span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="appearance-none bg-transparent text-sm uppercase tracking-wider font-bold text-white border-b border-zinc-700 py-1 pr-8 focus:outline-none focus:border-white cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-black text-white">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-white">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
