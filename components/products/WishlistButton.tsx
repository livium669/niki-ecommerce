'use client';

import { useState, useTransition } from 'react';
import { toggleWishlist } from '@/lib/actions/wishlist';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

interface WishlistButtonProps {
  productId: string;
  initialIsActive: boolean;
}

export default function WishlistButton({ productId, initialIsActive }: WishlistButtonProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation if inside a link

    if (!session) {
      router.push(`/login?callbackUrl=${pathname}`);
      return;
    }

    if (isPending) return;

    // Optimistic update
    const previousState = isActive;
    setIsActive(!previousState);

    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (result.error) {
        // Revert on error
        setIsActive(previousState);
        alert(result.error); // Simple error handling
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative z-20 flex items-center justify-center transition-colors group ${
        isActive ? 'text-red-600' : 'text-zinc-500 hover:text-white'
      }`}
      aria-label={isActive ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isActive ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 transition-transform group-hover:scale-110 active:scale-95"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
