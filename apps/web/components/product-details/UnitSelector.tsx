interface Unit {
    label: string;
    price: number;
    mrp: number;
    discount: number;
    disabled?: boolean;
}

interface Props {
    units: Unit[];
    selected: number;
    onSelect: (index: number) => void;
}

export default function UnitSelector({
    units,
    selected,
    onSelect,
}: Props) {
    return (
        <div className="flex gap-4 flex-wrap">
            {units.map((unit, index) => (
                <button
                    key={index}
                    disabled={unit.disabled}
                    onClick={() => onSelect(index)}
                    className={`relative border rounded-xl p-4 w-[150px] text-left transition ${selected === index
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200"
                        } ${unit.disabled && "opacity-50 cursor-not-allowed"}`}
                >
                    <span className="absolute -top-2 left-3 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        {unit.discount}% OFF
                    </span>

                    <p className="text-sm font-semibold">
                        {unit.label}
                    </p>

                    <p className="text-sm font-bold mt-1">
                        ₹{unit.price}
                    </p>

                    <p className="text-xs line-through text-gray-400">
                        ₹{unit.mrp}
                    </p>

                    {unit.disabled && (
                        <p className="text-xs mt-1 text-red-500">
                            Out of stock
                        </p>
                    )}
                </button>
            ))}
        </div>
    );
}