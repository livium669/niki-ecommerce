import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';
import { updateCartItem, clearCart as clearCartAction } from '@/lib/actions/cart';

interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  note: string | null;
  isLocalLoaded: boolean;
  userEmail: string | null; // Used to check if we should sync actions
  
  // Actions
  setUserEmail: (email: string | null) => void;
  addItem: (product: Product) => void;
  removeItem: (id: number | string) => void;
  incQty: (id: number | string) => void;
  decQty: (id: number | string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearNote: () => void;
  setItems: (items: CartItem[]) => void;
  setIsLocalLoaded: (loaded: boolean) => void;
  
  // Helpers
  bumpNote: (msg: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      note: null,
      isLocalLoaded: false,
      userEmail: null,

      setUserEmail: (email) => set({ userEmail: email }),

      setItems: (items) => set({ items }),
      
      setIsLocalLoaded: (loaded) => set({ isLocalLoaded: loaded }),

      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
      clearNote: () => set({ note: null }),

      bumpNote: (msg: string) => {
        set({ note: msg });
        setTimeout(() => set({ note: null }), 1200);
      },

      addItem: (product) => {
        const { items, userEmail, bumpNote } = get();
        const found = items.find((i) => i.product.id === product.id);
        const currentQty = found ? found.qty : 0;

        if (product.stock !== undefined && currentQty + 1 > product.stock) {
          bumpNote(`Stock limit reached! (${product.stock} max)`);
          return;
        }

        const newQty = currentQty + 1;

        if (userEmail) {
          updateCartItem(String(product.id), newQty).catch(err => {
            console.error('Failed to sync add item:', err);
          });
        }
        bumpNote(`Added: ${product.name}`);

        set((state) => {
          const exists = state.items.find((i) => i.product.id === product.id);
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { product, qty: 1 }] };
        });
      },

      removeItem: (id) => {
        const { userEmail, bumpNote, items } = get();
        const target = items.find((i) => i.product.id === id);
        if (target) {
          bumpNote(`Removed: ${target.product.name}`);
          if (userEmail) {
            updateCartItem(String(id), 0).catch(err => console.error('Failed to sync remove:', err));
          }
        }
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== id),
        }));
      },

      incQty: (id) => {
        const { items, userEmail, bumpNote } = get();
        const target = items.find((i) => i.product.id === id);
        if (!target) return;

        if (target.product.stock !== undefined && target.qty + 1 > target.product.stock) {
          bumpNote(`Stock limit reached!`);
          return;
        }

        const newQty = target.qty + 1;
        if (userEmail) {
          updateCartItem(String(id), newQty).catch(err => console.error('Failed to sync inc:', err));
        }

        bumpNote(`Quantity: ${target.product.name} +1`);
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === id ? { ...i, qty: i.qty + 1 } : i
          ),
        }));
      },

      decQty: (id) => {
        const { items, userEmail, bumpNote } = get();
        const target = items.find((i) => i.product.id === id);
        if (!target) return;

        const newQty = target.qty - 1;
        if (userEmail) {
          updateCartItem(String(id), newQty).catch(err => console.error('Failed to sync dec:', err));
        }

        bumpNote(`Quantity: ${target.product.name} -1`);
        set((state) => ({
          items: state.items.flatMap((i) => {
            if (i.product.id !== id) return [i];
            if (i.qty <= 1) return [];
            return [{ ...i, qty: i.qty - 1 }];
          }),
        }));
      },

      clear: () => {
        const { userEmail, bumpNote } = get();
        set({ items: [] });
        if (userEmail) {
          clearCartAction().catch(err => console.error('Failed to sync clear:', err));
        }
        bumpNote('Cart cleared');
      },
    }),
    {
      name: 'cart-storage', // unique name
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
      onRehydrateStorage: () => (state) => {
        state?.setIsLocalLoaded(true);
      },
    }
  )
);
