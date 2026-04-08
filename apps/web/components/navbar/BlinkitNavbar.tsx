"use client";

import { ShoppingCart, Search, ChevronDown, Heart } from "lucide-react";
import Link from "next/link";

import {

    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@workspace/ui/components/sheet";

import { Sheet } from "@workspace/ui/components/sheet";
import { useStore } from "@/context/cart-context";

export default function BlinkitNavbar() {
    const { state, totalItems, increment, decrement, toggleWishlist } = useStore();

    const cartTotal = state.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#f8d544]">
            <div className="max-w-[1400px] mx-auto flex items-center gap-4 px-4 py-3 md:gap-6 md:px-6">

                {/* Logo */}
                <Link href="/" className="flex items-center shrink-0">
                    <span className="text-3xl font-bold text-[#F7C600] tracking-tight">
                        blink
                    </span>
                    <span className="text-3xl font-bold text-green-600">
                        it
                    </span>
                </Link>

                {/* Location */}
                <div className="hidden flex-col leading-tight cursor-pointer md:flex">
                    <span className="font-semibold text-black text-sm">
                        Delivery in 10 minutes
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>3-31-2666, near Vinaya Hospital</span>
                        <ChevronDown size={14} />
                    </div>
                </div>

                {/* Search */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center rounded-xl border border-black/10 bg-white px-4 py-2.5 shadow-sm">
                        <Search className="text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder='Search "milk", "chips", "fruits"'
                            className="bg-transparent outline-none w-full ml-2 text-sm text-black"
                        />
                    </div>
                </div>

                {/* Wishlist Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="relative hidden md:block">
                            <Heart size={22} />
                            {state.wishlist.length > 0 && (
                                <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-2">
                                    {state.wishlist.length}
                                </span>
                            )}
                        </button>
                    </SheetTrigger>

                    <SheetContent className="w-[380px]">
                        <SheetHeader>
                            <SheetTitle>Wishlist</SheetTitle>
                        </SheetHeader>

                        <div className="mt-6 space-y-4">
                            {state.wishlist.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    Your wishlist is empty
                                </p>
                            )}

                            {state.wishlist.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ₹{item.price}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => toggleWishlist(item)}
                                        className="text-red-500 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Cart Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="flex items-center gap-2 rounded-lg bg-[#0c831f] px-3 py-2 text-white shadow-sm transition hover:bg-[#0a6f1a] md:px-4">
                            <ShoppingCart size={18} />

                            <div className="text-left leading-tight">
                                <div className="text-xs">
                                    {totalItems} items
                                </div>

                                <div className="text-sm font-bold">
                                    ₹{cartTotal}
                                </div>
                            </div>
                        </button>
                    </SheetTrigger>

                    <SheetContent className="w-[420px]">
                        <SheetHeader>
                            <SheetTitle>Your Cart</SheetTitle>
                        </SheetHeader>

                        <div className="mt-6 space-y-4">

                            {state.cart.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    Your cart is empty
                                </p>
                            )}

                            {state.cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {item.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            ₹{item.price}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 border rounded-md">

                                        <button
                                            onClick={() => decrement(item.id)}
                                            className="px-2"
                                        >
                                            -
                                        </button>

                                        <span className="px-2 text-sm">
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() => increment(item.id)}
                                            className="px-2"
                                        >
                                            +
                                        </button>

                                    </div>
                                </div>
                            ))}

                        </div>
                    </SheetContent>
                </Sheet>

            </div>
        </header>
    );
}