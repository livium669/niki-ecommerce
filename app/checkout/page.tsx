'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { createCheckoutSession } from '../../lib/actions/stripe';

export default function CheckoutPage() {
  const { items, totalAmount } = useCart();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const router = useRouter();

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        productVariantId: String(i.product.id),
        quantity: i.qty
      }));
      
      const { url } = await createCheckoutSession(orderItems, couponCode);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (e: any) {
      alert("Failed to proceed to checkout: " + (e.message || "Unknown error"));
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-black min-h-screen selection:bg-white selection:text-black">
      <Navbar />
      <main className="px-6 py-20 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Checkout</h1>
          <Link href="/" className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white">Back</Link>
        </div>
        {items.length === 0 ? (
          <p className="text-gray-400">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-6 mb-12">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <p className="text-sm md:text-base font-bold uppercase">{product.name}</p>
                    <span className="text-xs text-zinc-500">Qty: {qty}</span>
                  </div>
                  <span className="text-sm md:text-base">{product.price}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-zinc-900 pt-6">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">Subtotal</span>
              <span className="text-xl font-light">${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="mt-6 mb-6">
              <label htmlFor="coupon" className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Discount Code</label>
              <input 
                type="text" 
                id="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors uppercase"
                placeholder="ENTER CODE"
              />
            </div>

            <div className="mt-10">
              <button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
