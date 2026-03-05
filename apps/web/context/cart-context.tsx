// /context/store.tsx
"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";

export type Product = {
    id: string; // unique id (sku)
    image: string;
    name: string;
    weight?: string;
    price: number;
};

type CartItem = Product & { quantity: number };

type State = {
    cart: CartItem[];
    wishlist: Product[];
};

type Action =
    | { type: "HYDRATE"; payload: State }
    | { type: "ADD_TO_CART"; payload: Product }
    | { type: "INCREMENT"; payload: { id: string } }
    | { type: "DECREMENT"; payload: { id: string } }
    | { type: "REMOVE_FROM_CART"; payload: { id: string } }
    | { type: "TOGGLE_WISHLIST"; payload: Product }
    | { type: "REMOVE_FROM_WISHLIST"; payload: { id: string } }
    | { type: "CLEAR_CART" };

const LOCAL_KEY = "pxlsgrds_store_v1";

const initialState: State = { cart: [], wishlist: [] };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "HYDRATE":
            return action.payload;
        case "ADD_TO_CART": {
            const p = action.payload;
            const exists = state.cart.find((c) => c.id === p.id);
            if (exists) {
                return {
                    ...state,
                    cart: state.cart.map((c) =>
                        c.id === p.id ? { ...c, quantity: c.quantity + 1 } : c
                    ),
                };
            }
            return { ...state, cart: [...state.cart, { ...p, quantity: 1 }] };
        }
        case "INCREMENT":
            return {
                ...state,
                cart: state.cart.map((c) =>
                    c.id === action.payload.id ? { ...c, quantity: c.quantity + 1 } : c
                ),
            };
        case "DECREMENT":
            return {
                ...state,
                cart: state.cart
                    .map((c) =>
                        c.id === action.payload.id ? { ...c, quantity: c.quantity - 1 } : c
                    )
                    .filter((c) => c.quantity > 0),
            };
        case "REMOVE_FROM_CART":
            return { ...state, cart: state.cart.filter((c) => c.id !== action.payload.id) };
        case "TOGGLE_WISHLIST": {
            const p = action.payload;
            const exists = state.wishlist.find((w) => w.id === p.id);
            if (exists) {
                return { ...state, wishlist: state.wishlist.filter((w) => w.id !== p.id) };
            }
            return { ...state, wishlist: [...state.wishlist, p] };
        }
        case "REMOVE_FROM_WISHLIST":
            return { ...state, wishlist: state.wishlist.filter((w) => w.id !== action.payload.id) };
        case "CLEAR_CART":
            return { ...state, cart: [] };
        default:
            return state;
    }
}

const StoreContext = createContext<{
    state: State;
    addToCart: (p: Product) => void;
    increment: (id: string) => void;
    decrement: (id: string) => void;
    toggleWishlist: (p: Product) => void;
    removeFromWishlist: (id: string) => void;
    getQuantity: (id: string) => number;
    totalItems: number;
    isWishlisted: (id: string) => boolean;
    clearCart: () => void;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Hydrate from localStorage once on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                dispatch({ type: "HYDRATE", payload: parsed });
            }
        } catch (e) {
            console.warn("Failed to hydrate store:", e);
        }
    }, []);

    // Persist to localStorage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn("Failed to persist store:", e);
        }
    }, [state]);

    const addToCart = (p: Product) => dispatch({ type: "ADD_TO_CART", payload: p });
    const increment = (id: string) => dispatch({ type: "INCREMENT", payload: { id } });
    const decrement = (id: string) => dispatch({ type: "DECREMENT", payload: { id } });
    const toggleWishlist = (p: Product) => dispatch({ type: "TOGGLE_WISHLIST", payload: p });
    const removeFromWishlist = (id: string) =>
        dispatch({ type: "REMOVE_FROM_WISHLIST", payload: { id } });
    const clearCart = () => dispatch({ type: "CLEAR_CART" });

    const getQuantity = (id: string) => state.cart.find((c) => c.id === id)?.quantity ?? 0;
    const totalItems = state.cart.reduce((s, it) => s + it.quantity, 0);
    const isWishlisted = (id: string) => state.wishlist.some((w) => w.id === id);

    return (
        <StoreContext.Provider
            value={{
                state,
                addToCart,
                increment,
                decrement,
                toggleWishlist,
                removeFromWishlist,
                getQuantity,
                totalItems,
                isWishlisted,
                clearCart,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used inside StoreProvider");
    return ctx;
}