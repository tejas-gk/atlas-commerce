interface ProductCardProps {
    image: string;
    name: string;
    weight: string;
    price: number;
}

export default function ProductCard({
    image,
    name,
    weight,
    price,
}: ProductCardProps) {
    return (
        <div className="bg-white rounded-xl border p-4 hover:shadow-md transition">
            <img
                src={image}
                alt={name}
                className="h-32 object-contain mx-auto mb-3"
            />

            <h4 className="text-sm font-medium mb-1 line-clamp-2">
                {name}
            </h4>

            <p className="text-xs text-gray-500 mb-2">{weight}</p>

            <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">₹{price}</span>
                <button className="border border-green-600 text-green-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-green-50">
                    ADD
                </button>
            </div>
        </div>
    );
}