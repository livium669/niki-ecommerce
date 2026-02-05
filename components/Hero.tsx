
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface HeroProps {
  // scrollProgress removed
}

const Hero: React.FC<HeroProps> = () => {
  // Background WebP - handling potential broken links with fallback
  const [bgUrl, setBgUrl] = useState("/heronikigif.webp");
  // Mobile specific background (Vertical) - Placeholder for better mobile visibility
  const mobileBgUrl = "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop";
  const fallbackUrl = "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=2000&auto=format&fit=crop";

  return (
    <section className="relative h-screen bg-black w-full overflow-hidden">
      <style>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.20); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s ease-in-out infinite;
        }
      `}</style>
      {/* Background */}
      <div className="absolute inset-0 w-full h-full">
        {/* Mobile Background */}
        <div className="block md:hidden w-full h-full relative">
          <Image 
            src={mobileBgUrl} 
            alt="Niki Cinematic Shoe Mobile" 
            fill
            priority
            sizes="100vw"
            className="object-cover animate-subtle-zoom transition-opacity duration-700"
          />
        </div>
        {/* Desktop Background */}
        <div className="hidden md:block w-full h-full relative">
          <Image 
            src={bgUrl} 
            alt="Niki Cinematic Shoe" 
            fill
            priority
            sizes="100vw"
            className="object-cover animate-subtle-zoom transition-opacity duration-700"
            onError={() => {
              setBgUrl(fallbackUrl);
            }}
          />
        </div>
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 md:from-transparent md:to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        {/* Mobile Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.5)_100%)] md:hidden" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center md:items-start justify-center text-center md:text-left px-6 md:px-16 z-10">
        <div className="w-full max-w-3xl flex flex-col items-center md:items-start">
          <h1 className="text-[18vw] md:text-[15vw] font-black tracking-tighter leading-none mb-6 md:mb-4 uppercase drop-shadow-2xl">
            NIKI
          </h1>
          <p className="max-w-xl text-lg md:text-xl font-light tracking-wide text-gray-200 mb-8 md:mb-12 drop-shadow-md">
            Engineered for those who never stop. The pinnacle of kinetic luxury.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
            <button className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-300 w-full sm:w-auto" onClick={() => window.location.href = "/products"}>
              Explore Collection
            </button>
          </div>
        </div>
      </div>


    </section>
  );
};

export default Hero;
