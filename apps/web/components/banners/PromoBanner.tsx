interface PromoBannerProps {
    title: string;
    subtitle: string;
    bg: string;
    image: string;
}

export default function PromoBanner({
    title,
    subtitle,
    bg,
    image,
}: PromoBannerProps) {
    return (
        <div className={`${bg} rounded-xl p-6 flex justify-between items-center`}>
            <div>
                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/90 mb-3">{subtitle}</p>
                <button className="bg-white text-black text-sm px-3 py-1 rounded-md">
                    Order Now
                </button>
            </div>
            <img src={image} alt="" className="h-20 object-contain" />
        </div>
    );
}