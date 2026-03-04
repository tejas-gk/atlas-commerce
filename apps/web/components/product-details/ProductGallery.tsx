"use client";

import { useState } from "react";

interface Props {
    images: string[];
}

export default function ProductGallery({ images }: Props) {
    const [selected, setSelected] = useState(images[0]);

    return (
        <div>
            {/* Main Image */}
            <div className="border rounded-xl p-6 bg-white">
                <img
                    src={selected}
                    alt="product"
                    className="w-full h-[450px] object-contain"
                />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setSelected(img)}
                        className={`border rounded-lg p-2 ${selected === img
                                ? "border-green-600"
                                : "border-gray-200"
                            }`}
                    >
                        <img
                            src={img}
                            className="w-16 h-16 object-contain"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}