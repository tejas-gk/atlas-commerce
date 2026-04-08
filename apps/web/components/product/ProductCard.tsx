"use client"
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";
// import ProductDetailsCard from "./product-details.card";
import useUser from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import { useStore } from "@/store";
import Ratings from "./ratings";



const ProductCard = ({
    product,
    isEvent,
}: {
    product: any;
    isEvent?: boolean;
}) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const addToCart = useStore((state: any) => state.addToCart);
    const addToWishlist = useStore((state: any) => state.addToWishlist);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
    const wishlist = useStore((state: any) => state.wishlist);
    const isWishlisted = wishlist.some((item: any) => item.id === product?.id);
    const cart = useStore((state: any) => state.cart);
    const isInCart = cart.some((item: any) => item.id === product.id);

    useEffect(() => {
        if (isEvent && product?.ending_date) {
            const interval = setInterval(() => {
                const endTime = new Date(product.ending_date).getTime();
                const now = Date.now();
                const diff = endTime - now;

                if (diff <= 0) {
                    setTimeLeft("Expired");
                    clearInterval(interval);
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
            }, 60000);
            return () => clearInterval(interval);
        }
        return;
    }, [isEvent, product?.ending_date]);



    return (
        <div className="relative h-full min-h-[320px] w-full rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            {isEvent && (
                <div className="absolute left-2 top-2 rounded-sm bg-red-600 px-2 py-1 text-[10px] font-semibold text-white shadow-md">
                    OFFER
                </div>
            )}

            {product?.stock <= 5 && (
                <div className="absolute right-2 top-2 rounded-sm bg-yellow-300 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
                    Limited Stock
                </div>
            )}

            <Link href={`/product/${product?.slug}`}>
                <img
                    src={
                        product?.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1635405074683-96d6921a2a68?w=500&auto=format&fit=crop&q=60"
                    }
                    alt={product?.title}
                    width={300}
                    height={300}
                    className="mx-auto h-[150px] w-full rounded-lg object-cover"
                />
            </Link>

            <Link
                href={`/shop/${product?.Shop?.id}`}
                className="mt-2 block text-xs font-medium text-[#0c831f]"
            >
                {product?.Shop?.name}
            </Link>

            <Link href={`/product/${product?.slug}`}>
                <h3 className="line-clamp-2 min-h-[42px] text-sm font-semibold text-gray-900">
                    {product?.title}
                </h3>
            </Link>

            <div className="mt-1">
                <Ratings rating={product?.ratings} />
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">
                        ${product?.sale_price}
                    </span>
                    <span className="text-sm line-through text-gray-400">
                        ${product?.regular_price}
                    </span>
                </div>

                <span className="text-xs font-medium text-gray-500">
                    {product?.totalSales || 0} sold
                </span>
            </div>

            {isEvent && timeLeft && (
                <div className="mt-2">
                    <span className="inline-block rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600">
                        {timeLeft}
                    </span>
                </div>
            )}

            <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
                <div className="rounded-full bg-white p-[6px] shadow-sm ring-1 ring-black/10">
                    <Heart
                        className="cursor-pointer hover:scale-110 transition"
                        size={18}
                        fill={isWishlisted ? "red" : "transparent"}
                        onClick={() =>
                            isWishlisted
                                ? removeFromWishlist(product.id, user, location, deviceInfo)
                                : addToWishlist(
                                    { ...product, quantity: 1 },
                                    user,
                                    location,
                                    deviceInfo
                                )
                        }
                        stroke={isWishlisted ? "red" : "#4B5563"}
                    />
                </div>

                <div className="rounded-full bg-white p-[6px] shadow-sm ring-1 ring-black/10">
                    <Eye
                        className="cursor-pointer text-[#4b5563] hover:scale-110 transition"
                        size={18}
                        onClick={() => setOpen(!open)}
                    />
                </div>

            </div>

            <button
                type="button"
                onClick={() =>
                    !isInCart &&
                    addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)
                }
                disabled={isInCart}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${isInCart
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                        : "border-[#0c831f] bg-[#e7f9ea] text-[#0c831f] hover:bg-[#d9f3dd]"
                    }`}
            >
                <ShoppingBag size={16} />
                {isInCart ? "Added" : "Add"}
            </button>

            {/* {open && <ProductDetailsCard data={product} setOpen={setOpen} />} */}
        </div>
    );
};

export default ProductCard;