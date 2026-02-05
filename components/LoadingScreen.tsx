 'use client';
import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="relative overflow-hidden mb-4">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white animate-pulse">
          NIKI
        </h1>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <p className="text-white text-xs uppercase tracking-[0.5em] font-light mt-4">
        Elevating Motion{dots}
      </p>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
