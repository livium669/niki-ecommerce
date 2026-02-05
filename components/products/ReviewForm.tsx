'use client';

import React, { useState, useActionState, useEffect } from 'react';
import StarRating from './StarRating';
import { addReview } from '@/lib/actions/reviews';
import { useRouter } from 'next/navigation';
import { reviewSchema } from '@/lib/validators';

interface ReviewFormProps {
  productId: string;
}

const initialState = {
  error: '',
  success: false,
};

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [clientError, setClientError] = useState('');
  const [state, formAction, isPending] = useActionState(addReview, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      setRating(0);
      setClientError('');
      // Optional: reset form content if needed, but HTML form resets on submission usually? 
      // Actually standard form submission resets, but with client action we might need to handle it.
      // We can use a ref to the form to reset it.
      const form = document.getElementById('review-form') as HTMLFormElement;
      if (form) form.reset();
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form 
      id="review-form" 
      action={(formData) => {
        const rawData = {
            productId: formData.get('productId'),
            rating: Number(formData.get('rating')),
            comment: formData.get('comment'),
        };
        const validation = reviewSchema.safeParse(rawData);
        if (!validation.success) {
            setClientError(validation.error.errors[0].message);
            return;
        }
        setClientError("");
        formAction(formData);
      }}
      className="bg-zinc-900/30 p-6 rounded-lg border border-white/5 space-y-6"
    >
      <h3 className="text-xl font-bold uppercase tracking-wide">Write a Review</h3>
      
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider">Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} editable size="lg" />
        {/* {state.error && !rating && <p className="text-red-500 text-sm">Please select a rating.</p>} */}
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium text-zinc-400 uppercase tracking-wider">Comment</label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          className="w-full bg-black/50 border border-white/10 rounded-md p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/40 transition-colors"
          placeholder="Share your thoughts about this product..."
          required
        ></textarea>
      </div>

      {(state.error || clientError) && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded text-sm">
          {clientError || state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded text-sm">
          Review submitted successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="w-full bg-white text-black font-bold uppercase tracking-wider py-3 px-6 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
