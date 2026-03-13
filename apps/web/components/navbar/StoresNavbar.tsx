"use client";

import { ShoppingCart, Heart, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

import useUser from "@/hooks/useUser";
import useLayout from "@/hooks/useLayout";

import { useStore } from "@/context/cart-context";

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@workspace/ui/components/sheet";

import HeaderBottom from "./header-bottom";

export default function StoresNavbar() {
    const { state, totalItems } = useStore();
    const { user, isLoading } = useUser();
    const { layout } = useLayout();

    const cartTotal = state.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const handleSearchClick = async () => {
        if (!searchQuery.trim()) return;

        setLoadingSuggestions(true);

        try {
            const res = await axiosInstance.get(
                `/product/api/search-products?q=${encodeURIComponent(searchQuery)}`
            );

            setSuggestions(res.data.products.slice(0, 10));
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    return (
        <header className="border-b bg-white">
            <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 py-3">

                {/* Logo */}
                <Link href="/stores" className="text-xl font-bold">
                    {layout?.siteName || "Stores"}
                </Link>

                {/* Search */}
                <div className="flex-1 relative">
                    <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                        <button onClick={handleSearchClick}>
                            <Search size={18} className="text-gray-500" />
                        </button>

                        <input
                            placeholder="Search products"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none ml-2 w-full"
                        />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="absolute w-full bg-white border border-gray-200 shadow-md mt-2 z-50 max-h-[300px] overflow-y-auto rounded-lg">
                            {suggestions.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/product/${item.slug}`}
                                    onClick={() => {
                                        setSuggestions([]);
                                        setSearchQuery("");
                                    }}
                                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    )}

                    {loadingSuggestions && (
                        <div className="absolute w-full bg-white border border-gray-200 shadow-md mt-2 px-4 py-2 text-sm rounded-lg">
                            Searching...
                        </div>
                    )}
                </div>

                {/* Wishlist */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="relative">
                            <Heart size={22} />

                            {state.wishlist.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                                    {state.wishlist.length}
                                </span>
                            )}
                        </button>
                    </SheetTrigger>

                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Wishlist</SheetTitle>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>

                {/* Cart */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg">
                            <ShoppingCart size={18} />

                            <div className="text-left">
                                <div className="text-xs">{totalItems} items</div>
                                <div className="text-sm font-bold">₹{cartTotal}</div>
                            </div>
                        </button>
                    </SheetTrigger>

                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Your Cart</SheetTitle>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>

                {/* User greeting (optional functionality from previous header) */}
                {!isLoading && user && (
                    <span className="text-sm font-medium">
                        Hello, {user?.name?.split(" ")[0]}
                    </span>
                )}

            </div>

            <HeaderBottom />
        </header>
    );
}