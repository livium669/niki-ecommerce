'use client';
import React, { useEffect, useMemo, useRef } from 'react';
import { Product } from '../types';
import { useSession } from '../lib/auth-client';
import { syncCart } from '../lib/actions/cart';
import { mockProducts } from '../lib/mock-data';
import { useCartStore } from '../lib/store/cart';

// Keep types for compatibility if exported
export type CartItem = { product: Product; qty: number };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { items, setItems, isLocalLoaded, setUserEmail } = useCartStore();
  const isSynced = useRef(false);

  // Update user email in store so actions can trigger server updates
  useEffect(() => {
    setUserEmail(session?.user?.email ?? null);
  }, [session?.user?.email, setUserEmail]);

  // Migrate legacy local storage if exists
  useEffect(() => {
    const legacy = localStorage.getItem('cart_items');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Migrating legacy cart items to Zustand store');
          setItems(parsed);
        }
      } catch (e) {
        console.error('Failed to migrate legacy cart:', e);
      } finally {
        localStorage.removeItem('cart_items');
      }
    }
  }, [setItems]);

  // Sync with DB on login
  useEffect(() => {
    if (!isLocalLoaded) return; // Wait for local storage load

    if (session?.user && !isSynced.current) {
      console.log('Starting cart sync for user:', session.user.email);
      
      const lastSyncedUser = localStorage.getItem('cart_synced_user');
      const isSameUser = lastSyncedUser === session.user.email;
      
      // If same user as last time, we assume local storage is just a cache of DB
      // So we don't send local items to be added again.
      // If different user (or first login), we merge local items.
      const localItemsDTO = isSameUser ? [] : items.map(i => ({
        productVariantId: String(i.product.id),
        quantity: i.qty
      }));
      
      console.log(`Sync mode: ${isSameUser ? 'FETCH_ONLY' : 'MERGE'}`, localItemsDTO);
      console.log('Current local items:', items.length);
      
      syncCart(localItemsDTO).then(serverItems => {
        console.log('Server returned items:', serverItems);
        
        // Self-healing: If server returns empty but we have local items, 
        // it implies a sync mismatch (server lost data, or we failed to send).
        // We force push local items to ensure persistence.
        // Removed isSameUser check to be more aggressive in protecting local data.
        if (serverItems.length === 0 && items.length > 0) {
           console.warn('Server cart is empty but local cart has items. Force pushing local items...');
           const forcePushDTO = items.map(i => ({
             productVariantId: String(i.product.id),
             quantity: i.qty
           }));
           
           syncCart(forcePushDTO).then(recoveredItems => {
              console.log('Recovery sync successful:', recoveredItems);
              localStorage.setItem('cart_synced_user', session.user.email);
              isSynced.current = true;
           }).catch(err => {
              console.error('Recovery sync failed:', err);
              isSynced.current = true;
           });
           return; // Stop processing empty response
        }

        // Mark this user as synced
        localStorage.setItem('cart_synced_user', session.user.email);
        
        // Use a Map to consolidate items by UUID and handle legacy IDs
        const hydratedMap = new Map<string, CartItem>();

        serverItems.forEach(si => {
          let p = mockProducts.find(mp => String(mp.id) === si.productVariantId);
          
          // Fallback for legacy IDs: try to match by index (assuming "1" -> index 0)
          if (!p) {
             const legacyIndex = parseInt(si.productVariantId) - 1;
             if (!isNaN(legacyIndex) && legacyIndex >= 0 && legacyIndex < mockProducts.length) {
                p = mockProducts[legacyIndex];
                console.log(`Recovered legacy product ID "${si.productVariantId}" -> UUID "${p.id}"`);
             }
          }

          if (!p) {
            console.warn('Failed to find product for ID:', si.productVariantId);
            return;
          }

          const adaptedProduct: Product = {
            id: p.id,
            name: p.name,
            category: p.category.name,
            price: (p.price / 100).toFixed(2),
            image: p.images[0],
            stock: p.stock
            // We might want to include slug here if the Product type allows it, 
            // but for now we stick to the interface.
          };

          // Merge quantities if we map multiple legacy/new IDs to the same product
          const existing = hydratedMap.get(p.id);
          const newQty = si.quantity + (existing ? existing.qty : 0);
          
          hydratedMap.set(p.id, { product: adaptedProduct, qty: newQty });
        });
        
        setItems(Array.from(hydratedMap.values()));
        isSynced.current = true;
      }).catch(err => {
        console.error("Cart sync failed:", err);
        // If sync fails (e.g. auth error), we keep the local items from localStorage
        // This prevents wiping the cart if the server session isn't ready yet.
        isSynced.current = true; // Mark as synced to prevent infinite retry loops
      });
    } else if (!session?.user) {
        isSynced.current = false;
    }
  }, [session?.user, items, isLocalLoaded, setItems]);

  return <>{children}</>;
}

export function useCart() {
  const store = useCartStore();
  
  const totalCount = useMemo(() => store.items.reduce((sum, i) => sum + i.qty, 0), [store.items]);
  const totalAmount = useMemo(() => {
    return store.items.reduce((sum, i) => {
      const n = parseFloat(String(i.product.price).replace(/[^0-9.]/g, '')) || 0;
      return sum + n * i.qty;
    }, 0);
  }, [store.items]);

  return {
    ...store,
    totalCount,
    totalAmount,
    // Alias helper for compatibility if needed
    // The store has bumpNote but it's internal logic mostly. 
    // The store exposes 'note' state.
    // The original useCart exposed note and clearNote.
    // The store exposes 'note' and 'clearNote'.
  };
}
