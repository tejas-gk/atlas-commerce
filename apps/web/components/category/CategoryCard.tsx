interface CategoryCardProps {
    image: string;
    label: string;
}

export default function CategoryCard({
    image,
    label,
}: CategoryCardProps) {
    return (
        <div className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-black/5 bg-white p-3 transition hover:border-black/10 hover:shadow-sm">
            <img src={image} alt={label} className="h-14 object-contain transition group-hover:scale-105" />
            <p className="line-clamp-2 text-center text-[11px] font-medium leading-4 text-black/80">{label}</p>
        </div>
    );
}