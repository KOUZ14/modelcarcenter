import { create } from "zustand";
import type { Listing } from "@/types";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  source?: "search" | "listing";
}

interface AccountState {
  selectedAccountId?: string;
  cart: CartItem[];
  setSelectedAccountId: (accountId?: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  selectedAccountId: undefined,
  cart: [],
  setSelectedAccountId: (accountId) =>
    set({
      selectedAccountId: accountId,
    }),
  addToCart: (item) =>
    set((state) => {
      if (state.cart.some((cartItem) => cartItem.id === item.id)) {
        return state;
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),
  clearCart: () => set({ cart: [] }),
}));

export const listingToCartItem = (listing: Listing): CartItem => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  currency: listing.currency,
  source: "listing",
});
