'use client';

import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  onRatingChange, 
  editable = false,
  size = 'md'
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    if (editable) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  const handleClick = (index: number) => {
    if (editable && onRatingChange) {
      onRatingChange(index);
    }
  };

  const currentRating = hoverRating || rating;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= currentRating;
        
        return (
          <button
            key={i}
            type="button"
            disabled={!editable}
            className={`${editable ? 'cursor-pointer' : 'cursor-default'} focus:outline-none transition-transform ${editable && isFilled ? 'hover:scale-110' : ''}`}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          >
            <svg 
              className={`${sizeClasses[size]} ${isFilled ? 'text-white fill-white' : 'text-zinc-600 fill-transparent'} transition-colors duration-200`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
