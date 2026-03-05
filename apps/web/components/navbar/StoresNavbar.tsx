"use client";

import { ShoppingCart, Heart, Search } from "lucide-react";
import Link from "next/link";

import { useStore } from "@/context/cart-context";

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@workspace/ui/components/sheet";

export default function StoresNavbar() {
    const { state, totalItems } = useStore();

    const cartTotal = state.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <header className="border-b bg-white">
            <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 py-3">

                <Link href="/stores" className="text-xl font-bold">
                    Stores
                </Link>

                <div className="flex-1">
                    <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                        <Search size={18} className="text-gray-500" />
                        <input
                            placeholder="Search products"
                            className="bg-transparent outline-none ml-2 w-full"
                        />
                    </div>
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

            </div>
        </header>
    );
}