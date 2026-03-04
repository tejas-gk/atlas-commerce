// components/movie/MoviePage.tsx

export default function MoviePage() {
    return (
        <div className="max-w-[1000px] mx-auto px-6 py-8">

            {/* Movie Header */}
            <div className="flex gap-6">
                <img
                    src="/poster.jpg"
                    className="w-32 rounded-xl"
                />

                <div>
                    <h1 className="text-2xl font-bold">
                        Marty Supreme
                    </h1>
                    <p className="text-gray-500">
                        A | English | 2 hr 32 min
                    </p>
                </div>
            </div>

            {/* Warning */}
            <div className="mt-6 bg-gray-100 p-4 rounded-lg text-sm">
                Movie suitable for adults (18+)
            </div>

            {/* Theatre List */}
            <div className="mt-8 space-y-6">

                <div className="border-b pb-4">
                    <h3 className="font-semibold">
                        PVR Ambience, Gurugram
                    </h3>

                    <div className="mt-3">
                        <button className="border px-6 py-2 rounded-lg hover:bg-gray-100">
                            09:00 PM
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold">
                        PVR Promenade, Delhi
                    </h3>

                    <div className="mt-3">
                        <button className="border px-6 py-2 rounded-lg hover:bg-gray-100">
                            04:00 PM
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}