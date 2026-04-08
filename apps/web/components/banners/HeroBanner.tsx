export default function HeroBanner() {
    return (
        <div className="w-full rounded-2xl border border-black/10 bg-gradient-to-r from-[#fff8cf] via-[#fff2a8] to-[#ffe969] p-6 md:p-8 flex items-center justify-between">
            <div className="max-w-2xl">
                <p className="mb-2 inline-flex rounded-full bg-[#0c831f] px-3 py-1 text-xs font-semibold text-white">
                    Delivery in minutes
                </p>
                <h1 className="mb-3 text-3xl font-extrabold leading-tight text-black md:text-4xl">
                    Stock up on groceries,
                    <br className="hidden md:block" /> daily essentials and more
                </h1>
                <p className="mb-4 max-w-xl text-sm text-black/70 md:text-base">
                    Get farm-fresh goodness and your everyday needs delivered fast.
                </p>
                <button className="rounded-lg bg-[#0c831f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0a6f1a] md:text-base">
                    Shop Now
                </button>
            </div>

            <img
                src="/banner-fruits.png"
                alt="fruits"
                className="hidden h-44 object-contain md:block"
            />
        </div>
    );
}