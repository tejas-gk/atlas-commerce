interface CategoryCardProps {
    image: string;
    label: string;
}

export default function CategoryCard({
    image,
    label,
}: CategoryCardProps) {
    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-gray-100 rounded-xl hover:shadow-md transition cursor-pointer">
            <img src={image} alt={label} className="h-16 object-contain" />
            <p className="text-xs text-center font-medium">{label}</p>
        </div>
    );
}