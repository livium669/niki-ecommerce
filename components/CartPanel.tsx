'use client';
import React from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';

export default function CartPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, incQty, decQty, removeItem, clear, totalAmount, note } = useCart();
  return (
    <div className={`${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} fixed inset-0 z-[200]`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? '' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-black border-l border-zinc-900 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-zinc-900">
          <h3 className="text-xl font-bold uppercase tracking-tight">Cart</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={clear}
              disabled={items.length === 0}
              className={`text-[10px] uppercase tracking-widest ${items.length === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}
            >
              Clear
            </button>
            <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white">Close</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">Your cart is empty.</p>
          ) : (
            items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase">{product.name}</p>
                  <span className="text-xs text-zinc-500">Quantity: {qty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decQty(product.id)}
                    className="text-xs px-2 py-1 border border-white/20 rounded hover:bg-white hover:text-black transition-colors"
                  >
                    −
                  </button>
                  <button
                    onClick={() => incQty(product.id)}
                    className="text-xs px-2 py-1 border border-white/20 rounded hover:bg-white hover:text-black transition-colors"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-xs px-2 py-1 border border-red-500/40 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <span className="text-sm w-16 text-right">${product.price}</span>
              </div>
            ))
          )}
        </div>
        <div className="p-6 border-t border-zinc-900 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400">Total</span>
          <span className="text-lg font-light">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="p-6">
          <Link
            href="/checkout"
            className={`block text-center bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors ${items.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
            onClick={onClose}
          >
            Checkout
          </Link>
        </div>
      </div>
      {note && (
        <div className="fixed bottom-6 left-6 z-[300] bg-white text-black text-xs px-3 py-2 rounded-full shadow">
          {note}
        </div>
      )}
    </div>
  );
}
