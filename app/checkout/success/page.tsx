'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { handleCheckoutSuccess } from '@/lib/actions/stripe';
import { useCart } from '@/components/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clear } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID found.');
      return;
    }

    const processOrder = async () => {
      try {
        const result = await handleCheckoutSuccess(sessionId);
        if (result.success) {
          setStatus('success');
          clear(); // Clear local cart
        } else {
          setStatus('error');
          setMessage(result.error || 'Payment validation failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred.');
      }
    };

    processOrder();
  }, [sessionId, clear]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      {status === 'loading' && (
        <>
          <h2 className="text-3xl font-bold uppercase animate-pulse">Processing Order...</h2>
          <p className="text-zinc-400">Please wait while we confirm your payment.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <h2 className="text-4xl font-black uppercase text-green-500">Order Confirmed!</h2>
          <p className="text-zinc-400 max-w-md">
            Thank you for your purchase. We have received your order and will begin processing it shortly.
          </p>
          <Link 
            href="/"
            className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors mt-8 inline-block"
          >
            Continue Shopping
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <h2 className="text-3xl font-bold uppercase text-red-500">Something went wrong</h2>
          <p className="text-zinc-400 max-w-md">{message}</p>
          <Link 
            href="/checkout"
            className="border border-white text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors mt-8 inline-block"
          >
            Try Again
          </Link>
        </>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-black min-h-screen selection:bg-white selection:text-black">
      <Navbar />
      <main className="px-6 py-20 max-w-5xl mx-auto">
        <Suspense fallback={<div className="text-center text-zinc-500">Loading...</div>}>
            <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
