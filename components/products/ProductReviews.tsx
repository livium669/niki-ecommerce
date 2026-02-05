import React from 'react';
import { getProductReviews, getProductRating } from '@/lib/db/queries';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import StarRating from './StarRating';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';

interface ProductReviewsProps {
  productId: string;
}

export default async function ProductReviews({ productId }: ProductReviewsProps) {
  const reviews = await getProductReviews(productId);
  const { average, count } = await getProductRating(productId);
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <section className="py-20 border-t border-white/10" id="reviews">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Summary Section */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Reviews ({count})</h2>
            
            <div className="flex items-center gap-4">
              <span className="text-6xl font-black">{average.toFixed(1)}</span>
              <div className="space-y-1">
                <StarRating rating={Math.round(average)} size="lg" />
                <p className="text-zinc-400 text-sm">Based on {count} reviews</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              {session ? (
                <ReviewForm productId={productId} />
              ) : (
                <div className="bg-zinc-900/30 p-6 rounded-lg border border-white/5 text-center space-y-4">
                  <h3 className="text-xl font-bold uppercase">Have this product?</h3>
                  <p className="text-zinc-400">Sign in to share your thoughts and help others make the right choice.</p>
                  <Link 
                    href="/login?callbackUrl=/products" 
                    className="inline-block bg-white text-black font-bold uppercase tracking-wider py-3 px-8 hover:bg-zinc-200 transition-colors"
                  >
                    Sign In to Review
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-8">
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>
    </section>
  );
}
