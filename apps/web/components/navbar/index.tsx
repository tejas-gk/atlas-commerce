"use client";

import { ShoppingCart, Search, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
    return (
        <header className="w-full border-b bg-white">
            <div className="max-w-[1400px] mx-auto flex items-center gap-6 px-6 py-3">

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <span className="text-3xl font-bold text-[#F7C600] tracking-tight">
                        blink
                    </span>
                    <span className="text-3xl font-bold text-green-600">
                        it
                    </span>
                </Link>

                {/* Location */}
                <div className="flex flex-col leading-tight cursor-pointer">
                    <span className="font-semibold text-black text-sm">
                        Store Closed
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>3-31-2666, near Vinaya Hospital...</span>
                        <ChevronDown size={14} />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1">
                    <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                        <Search className="text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder='Search "butter"'
                            className="bg-transparent outline-none w-full ml-2 text-sm text-black"
                        />
                    </div>
                </div>

                {/* Login */}
                <button className="text-gray-800 font-medium hover:text-black">
                    Login
                </button>

                {/* Cart */}
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                    <ShoppingCart size={18} />
                    <div className="text-left leading-tight">
                        <div className="text-xs">3 items</div>
                        <div className="text-sm font-bold">₹121</div>
                    </div>
                </button>

            </div>
        </header>
    );
}