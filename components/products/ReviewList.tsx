import React from 'react';
import StarRating from './StarRating';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  } | null;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-lg">No reviews yet.</p>
        <p className="text-sm">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-white/5 pb-8 last:border-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative">
                {review.user?.image ? (
                  <Image 
                    src={review.user.image} 
                    alt={review.user.name || 'User'} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                    {review.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-white">{review.user?.name || 'Anonymous'}</h4>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-zinc-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}
