'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get('search') || '');
  const [debouncedText, setDebouncedText] = useState(text);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(text);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [text]);

  // URL update effect
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    
    // Avoid redundant updates if the search term hasn't changed from the URL
    if (debouncedText === currentSearch) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedText) {
      params.set('search', debouncedText);
    } else {
      params.delete('search');
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [debouncedText, router, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <input 
        type="text" 
        placeholder="Search by name or description..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-zinc-900/50 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors text-sm uppercase tracking-wider"
      />
      <svg 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
  );
}
