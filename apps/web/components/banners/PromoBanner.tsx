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
    const isLight = bg.includes("#facc15") || bg.includes("#d1d5db");

    return (
        <div className={`${bg} rounded-xl border border-black/10 p-5 md:p-6 flex justify-between items-center`}>
            <div>
                <h3 className={`mb-1 text-lg font-bold ${isLight ? "text-black" : "text-white"}`}>{title}</h3>
                <p className={`mb-3 text-sm ${isLight ? "text-black/75" : "text-white/90"}`}>{subtitle}</p>
                <button className={`rounded-md px-3 py-1 text-sm font-semibold ${isLight ? "bg-black text-white" : "bg-white text-black"}`}>
                    Order Now
                </button>
            </div>
            <img src={image} alt="" className="h-20 object-contain" />
        </div>
    );
}