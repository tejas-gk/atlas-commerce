export default function HeroBanner() {
    return (
        <div className="w-full rounded-xl bg-gradient-to-r from-green-700 to-green-400 text-white p-10 flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold mb-3">
                    Stock up on daily essentials
                </h1>
                <p className="text-lg opacity-90 mb-4 max-w-xl">
                    Get farm-fresh goodness & a range of exotic fruits, vegetables,
                    eggs & more
                </p>
                <button className="bg-white text-green-700 px-5 py-2 rounded-md font-semibold">
                    Shop Now
                </button>
            </div>

            <img
                src="/banner-fruits.png"
                alt="fruits"
                className="h-48 object-contain hidden md:block"
            />
        </div>
    );
}