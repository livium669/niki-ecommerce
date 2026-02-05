"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils/query';

const filters = [
  {
    id: 'gender',
    name: 'Gender',
    options: [
      { value: 'men', label: 'Men' },
      { value: 'women', label: 'Women' },
    ],
  },
  {
    id: 'category',
    name: 'Category',
    options: [
      { value: 'performance', label: 'Performance' },
      { value: 'lifestyle', label: 'Lifestyle' },
      { value: 'racing', label: 'Racing' },
    ],
  },
  {
    id: 'color',
    name: 'Color',
    options: [
      { value: 'black', label: 'Black' },
      { value: 'white', label: 'White' },
      { value: 'red', label: 'Red' },
    ],
  },
  {
    id: 'size',
    name: 'Size',
    options: [
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
    ],
  },
  // Simple price range for now
  {
    id: 'price',
    name: 'Price',
    options: [
      { value: '0-150', label: '$0 - $150' },
      { value: '150-250', label: '$150 - $250' },
      { value: '250-500', label: '$250+' },
    ],
  },
];

export default function Filters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (filterId: string, value: string) => {
    const currentParams = searchParams.toString();
    const currentValues = searchParams.get(filterId)?.split(',') || [];
    
    let newValues: string[];
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    let newUrl = '';

    if (newValues.length > 0) {
      newUrl = formUrlQuery({
        params: currentParams,
        updates: {
          [filterId]: newValues.join(','),
        },
        baseUrl: window.location.pathname,
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: currentParams,
        keysToRemove: [filterId],
        baseUrl: window.location.pathname,
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-zinc-900 text-white uppercase tracking-widest text-xs font-bold rounded-lg"
        >
          Filters
        </button>
      </div>

      {/* Sidebar / Drawer */}
      <div className={`
        fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Overlay for mobile */}
        <div 
          className={`absolute inset-0 bg-black/50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
          onClick={() => setIsOpen(false)}
        />

        <div className="relative h-full w-[300px] lg:w-full bg-black lg:bg-transparent p-6 lg:p-0 overflow-y-auto border-r border-zinc-800 lg:border-none">
          <div className="flex justify-between items-center lg:hidden mb-6">
            <h2 className="text-xl font-bold uppercase">Filters</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="space-y-8">
            {filters.map((section) => (
              <div key={section.id}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-white">{section.name}</h3>
                <div className="space-y-3">
                  {section.options.map((option) => {
                    const isChecked = searchParams.get(section.id)?.split(',').includes(option.value);
                    return (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                        <div className={`
                          w-4 h-4 border flex items-center justify-center transition-colors
                          ${isChecked ? 'bg-white border-white' : 'border-zinc-700 group-hover:border-zinc-500'}
                        `}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${isChecked ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                          {option.label}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked || false}
                          onChange={() => handleFilterChange(section.id, option.value)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
