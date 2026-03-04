export default function WhyShop() {
    const items = [
        {
            title: "Round The Clock Delivery",
            desc: "Get items delivered to your doorstep whenever you need them.",
        },
        {
            title: "Best Prices & Offers",
            desc: "Best price destination with offers directly from manufacturers.",
        },
        {
            title: "Wide Assortment",
            desc: "Choose from 30,000+ products across multiple categories.",
        },
    ];

    return (
        <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">
                Why shop from blinkit?
            </h3>

            <div className="space-y-6">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100" />
                        <div>
                            <p className="font-semibold text-sm">
                                {item.title}
                            </p>
                            <p className="text-sm text-gray-600">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}