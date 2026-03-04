interface Props {
    price: number;
    mrp: number;
    discount: number;
}

export default function PriceBlock({
    price,
    mrp,
    discount,
}: Props) {
    return (
        <div className="mt-4">
            <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">
                    ₹{price}
                </span>
                <span className="text-gray-400 line-through">
                    ₹{mrp}
                </span>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                    {discount}% OFF
                </span>
            </div>

            <p className="text-xs text-gray-500 mt-1">
                (Inclusive of all taxes)
            </p>
        </div>
    );
}