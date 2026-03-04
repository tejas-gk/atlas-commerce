"use client";

import { useState } from "react";
import ProductGallery from "./ProductGallery";
import UnitSelector from "./UnitSelector";
import PriceBlock from "./PriceBlock";
import WhyShop from "./WhyShop";

export default function ProductDetailsPage() {
    const images = [
        "https://plus.unsplash.com/premium_photo-1771601434998-9f668cbf9d05?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1771601434998-9f668cbf9d05?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1771601434998-9f668cbf9d05?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ];

    const units = [
        { label: "44 pcs", price: 796, mrp: 1399, discount: 43 },
        { label: "88 pcs", price: 1382, mrp: 2810, discount: 50 },
        { label: "2 x 16 pcs", price: 1565, mrp: 2798, discount: 44, disabled: true },
    ];

    const [selectedUnit, setSelectedUnit] = useState(0);
    const current = units[selectedUnit];

    return (
        <div className="mx-auto px-6 py-8 grid md:grid-cols-3 gap-12">

            {/* LEFT */}
            <ProductGallery images={images} />

            {/* RIGHT */}
            <div>
                <p className="text-sm text-gray-500 mb-2">
                    Home / Diapers & More
                </p>

                <h1 className="text-2xl font-bold mb-6">
                    Pampers Premium Care Pant Style Baby Diaper (L)
                </h1>

                <p className="font-semibold mb-2">Select Unit</p>

                <UnitSelector
                    units={units}
                    selected={selectedUnit}
                    onSelect={setSelectedUnit}
                />

                <PriceBlock
                    price={current.price}
                    mrp={current.mrp}
                    discount={current.discount}
                />

                <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                    Add to cart
                </button>

                <WhyShop />
            </div>
        </div>
    );
}