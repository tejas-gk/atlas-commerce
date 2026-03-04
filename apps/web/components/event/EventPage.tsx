// components/event/EventPage.tsx

"use client";

export default function EventPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8">

            {/* Header */}
            <h1 className="text-3xl font-bold">
                Besharam Tour 2026 | Delhi
            </h1>

            <p className="text-blue-600 mt-2">
                Sat, 21 Mar, 9:00 PM – Sun, 22 Mar, 1:00 AM
            </p>

            {/* Banner */}
            <div className="mt-6 rounded-xl overflow-hidden">
                <img
                    src="/event-banner.jpg"
                    className="w-full h-[350px] object-cover"
                />
            </div>

            <div className="grid md:grid-cols-[1fr_380px] gap-12 mt-8">

                {/* LEFT */}
                <div>
                    <h2 className="text-xl font-semibold mb-3">
                        About
                    </h2>
                    <p className="text-gray-600">
                        Besharam by BohB is more than a party —
                        it’s a state of mind.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-3">
                        Things to know
                    </h2>
                    <ul className="space-y-2 text-gray-600">
                        <li>• Event will be in Hindi & English</li>
                        <li>• Duration: 4 hours</li>
                        <li>• 21+ only</li>
                    </ul>
                </div>

                {/* RIGHT BOOKING CARD */}
                <div className="sticky top-24 border rounded-xl p-6 shadow-sm h-fit">
                    <p className="text-sm text-gray-500">
                        AURO | Hauz Khas
                    </p>

                    <p className="mt-4 text-2xl font-bold">
                        ₹799 onwards
                    </p>

                    <button className="w-full mt-6 bg-black text-white py-3 rounded-lg font-semibold">
                        Book Tickets
                    </button>
                </div>

            </div>
        </div>
    );
}