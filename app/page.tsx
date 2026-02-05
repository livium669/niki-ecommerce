import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Collection from '../components/Collection';
import Innovation from '../components/Innovation';
import Footer from '../components/Footer';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/client';
import { wishlistTable } from '@/lib/db/schemas/commerce';
import { eq } from 'drizzle-orm';

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  let wishlistProductIds: string[] = [];
  if (session?.user) {
    const wishlistItems = await db.select({ productId: wishlistTable.productId })
      .from(wishlistTable)
      .where(eq(wishlistTable.userId, session.user.id));
    wishlistProductIds = wishlistItems.map(item => item.productId);
  }

  return (
    <div className="relative bg-black min-h-screen selection:bg-white selection:text-black">
      <Navbar />
      <main>
        <Hero />
        <div className="relative z-10">
          <Collection id="collection" wishlistProductIds={wishlistProductIds} />
          <Innovation id="technology" />
          <section id="story" className="py-32 px-6 flex flex-col items-center justify-center text-center bg-black">
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter uppercase">Our Legacy</h2>
            <p className="max-w-2xl text-gray-400 text-lg md:text-xl font-light leading-relaxed">
              Founded on the principle of perpetual motion, Niki creates footwear that exists between high-performance engineering and timeless minimalist aesthetics.
            </p>
            <div className="mt-12 w-px h-24 bg-gradient-to-b from-white to-transparent" />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
