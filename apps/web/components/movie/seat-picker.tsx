"use client"

import { useState, useMemo, useCallback } from "react"
import { generateSeatLayout } from "@/lib/data"
import { useRouter } from "next/navigation"

interface SelectedSeat {
  row: string
  number: number
  category: string
  price: number
}

export function SeatPicker({ showtime }: { showtime: string }) {
  const router = useRouter()
  const categories = useMemo(() => generateSeatLayout(), [])
  const [selected, setSelected] = useState<SelectedSeat[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const toggleSeat = useCallback(
    (row: string, number: number, category: string, price: number) => {
      setSelected((prev) => {
        const exists = prev.find((s) => s.row === row && s.number === number)
        if (exists) return prev.filter((s) => !(s.row === row && s.number === number))
        if (prev.length >= 10) return prev
        return [...prev, { row, number, category, price }]
      })
    },
    []
  )

  const isSelected = useCallback(
    (row: string, number: number) =>
      selected.some((s) => s.row === row && s.number === number),
    [selected]
  )

  const total = selected.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Wed</span>
            <br />
            04 Mar
          </div>
          <div className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
            {showtime}
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="mx-auto max-w-4xl overflow-x-auto px-4 py-6">
        <div className="min-w-[700px]">
          {/* Screen indicator */}
          <div className="mb-8 text-center">
            <div className="mx-auto h-1 w-48 rounded-full bg-border" />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              Screen this side
            </p>
          </div>

          {categories.map((category) => (
            <div key={category.name} className="mb-6">
              <h3 className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-foreground">
                {category.name} : <span className="font-sans">&#8377;</span>{category.price}
              </h3>
              {category.rows.map((row) => (
                <div key={row.label} className="mb-2 flex items-center gap-3">
                  <span className="w-6 text-right text-sm font-semibold text-muted-foreground">
                    {row.label}
                  </span>
                  <div className="flex flex-1 items-center justify-center gap-4">
                    {row.seats.map((group, gi) => (
                      <div key={gi} className="flex gap-1">
                        {group.map((seat) => (
                          <button
                            key={`${row.label}-${seat.number}`}
                            disabled={!seat.available}
                            onClick={() =>
                              toggleSeat(row.label, seat.number, category.name, category.price)
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-all ${
                              !seat.available
                                ? "cursor-not-allowed bg-secondary text-muted-foreground/40"
                                : isSelected(row.label, seat.number)
                                ? "bg-accent text-accent-foreground shadow-sm ring-2 ring-accent/30"
                                : "border border-border bg-card text-foreground hover:border-accent hover:bg-accent/10"
                            }`}
                            aria-label={`Row ${row.label} Seat ${seat.number}${
                              !seat.available ? " - unavailable" : ""
                            }`}
                          >
                            {seat.available ? (
                              seat.number
                            ) : (
                              <span className="text-muted-foreground/40">x</span>
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-md border border-border bg-card" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-md bg-accent" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-md bg-secondary" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-4 py-4 shadow-lg">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Selected</p>
              <p className="text-lg font-bold text-foreground">
                {selected.length} {selected.length === 1 ? "Seat" : "Seats"}
              </p>
              <p className="text-xs text-muted-foreground">
                {selected.map((s) => `${s.row}${s.number}`).join(", ")} &middot;{" "}
                <span className="font-sans">&#8377;</span>{total.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-xl bg-foreground px-8 py-3 text-sm font-bold text-background hover:bg-foreground/90 transition-colors"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Booking Summary</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Show</span>
                <span className="text-foreground font-medium">Wed, 04 Mar - {showtime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seats</span>
                <span className="text-foreground font-medium">
                  {selected.map((s) => `${s.row}${s.number}`).join(", ")}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                {Array.from(new Set(selected.map((s) => s.category))).map((cat) => {
                  const catSeats = selected.filter((s) => s.category === cat)
                  return (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {cat} x{catSeats.length}
                      </span>
                      <span className="text-foreground font-medium">
                        <span className="font-sans">&#8377;</span>
                        {(catSeats[0].price * catSeats.length).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  <span className="font-sans">&#8377;</span>{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Go back
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setSelected([])
                  router.push("/")
                }}
                className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background hover:bg-foreground/90 transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
