"use client";

import { useState } from "react";

export default function SeatBooking() {
    const rows = ["K", "J", "H", "G", "F", "E", "D", "C", "B", "A"];
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSeat = (seat: string) => {
        setSelected(prev =>
            prev.includes(seat)
                ? prev.filter(s => s !== seat)
                : [...prev, seat]
        );
    };

    return (
        <div className="max-w-[900px] mx-auto py-10">

            <h2 className="text-center font-semibold mb-6">
                PRIME : ₹330
            </h2>

            <div className="space-y-4">
                {rows.map(row => (
                    <div key={row} className="flex items-center gap-3">
                        <span className="w-6">{row}</span>

                        <div className="flex gap-2 flex-wrap">
                            {[...Array(14)].map((_, i) => {
                                const seatId = `${row}${i + 1}`;
                                const isSelected = selected.includes(seatId);

                                return (
                                    <button
                                        key={seatId}
                                        onClick={() => toggleSeat(seatId)}
                                        className={`w-8 h-8 rounded border text-xs
                      ${isSelected
                                                ? "bg-purple-500 text-white"
                                                : "bg-white hover:bg-gray-100"}`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Screen */}
            <div className="mt-12 text-center">
                <div className="w-[300px] h-6 mx-auto bg-purple-300 rounded-t-xl" />
                <p className="text-xs mt-2 text-gray-500">
                    Screen
                </p>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between max-w-[900px] mx-auto">
                <p>
                    Selected: {selected.length} Seats
                </p>

                <button className="bg-black text-white px-6 py-2 rounded-lg">
                    Proceed
                </button>
            </div>
        </div>
    );
}