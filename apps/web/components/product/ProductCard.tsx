// components/ProductCard.tsx
"use client";

import { Product, useStore } from "@/context/cart-context";
import React from "react";


type Props = Product;

export default function ProductCard({ id, image, name, weight, price }: Props) {
    const { addToCart, increment, decrement, getQuantity, toggleWishlist, isWishlisted } = useStore();

    const qty = getQuantity(id);
    const wish = isWishlisted(id);

    const product = { id, image, name, weight, price };

    return (
        <div className="bg-white rounded-xl border p-4 hover:shadow-md transition relative">
            <button
                aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3 right-3 p-1 rounded-full transition ${wish ? "text-red-600" : "text-gray-400 hover:text-red-500"
                    }`}
                title={wish ? "Remove from wishlist" : "Add to wishlist"}
            >
                {/* simple heart svg */}
                {wish ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="block">
                        <path d="M12 21s-7-4.35-9.17-6.36C0.9 12.96 1.36 9.63 4.2 7.8 6.26 6.41 9.08 6.7 11 8.31 12.92 6.7 15.74 6.41 17.8 7.8c2.84 1.83 3.3 5.16 1.37 7.84C19 16.65 12 21 12 21z" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 21s-7-4.35-9.17-6.36C0.9 12.96 1.36 9.63 4.2 7.8 6.26 6.41 9.08 6.7 11 8.31 12.92 6.7 15.74 6.41 17.8 7.8c2.84 1.83 3.3 5.16 1.37 7.84C19 16.65 12 21 12 21z" />
                    </svg>
                )}
            </button>

            <img src={image} alt={name} className="h-32 object-contain mx-auto mb-3" />

            <h4 className="text-sm font-medium mb-1 line-clamp-2">{name}</h4>

            {weight && <p className="text-xs text-gray-500 mb-2">{weight}</p>}

            <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">₹{price}</span>

                {qty === 0 ? (
                    <button
                        onClick={() => addToCart(product)}
                        className="border border-green-600 text-green-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-green-50"
                    >
                        ADD
                    </button>
                ) : (
                    <div className="flex items-center border border-green-600 rounded-md">
                        <button
                            onClick={() => decrement(id)}
                            className="px-3 py-1 text-green-600 font-bold"
                            aria-label="decrement"
                        >
                            −
                        </button>

                        <span className="px-4 text-sm font-semibold">{qty}</span>

                        <button
                            onClick={() => increment(id)}
                            className="px-3 py-1 text-green-600 font-bold"
                            aria-label="increment"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}