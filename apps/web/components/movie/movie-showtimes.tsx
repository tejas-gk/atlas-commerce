"use client"

import { useState } from "react"
import { Play, Heart, Info } from "lucide-react"
import Link from "next/link"
import type { Movie } from "@/lib/data"
import { theaters } from "@/lib/data"

const dates = [
  { day: "4", label: "Wed", month: "MAR", active: true },
  { day: "5", label: "Thu", month: "", active: false },
]

const showFilters = ["After 5 PM", "Wheelchair Friendly", "Recliners", "Premium Seats"]

export function MovieShowtimes({ movie }: { movie: Movie }) {
  const [activeDate, setActiveDate] = useState(0)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  function toggleFilter(f: string) {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    )
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const filteredTheaters = theaters.filter((t) => {
    if (activeFilters.length === 0) return true
    if (activeFilters.includes("After 5 PM")) {
      return t.showtimes.some((s) => {
        const hour = parseInt(s.time.split(":")[0])
        const isPM = s.time.includes("PM")
        return isPM && hour >= 5 && hour !== 12
      })
    }
    return true
  })

  return (
    <div className="mx-auto max-w-4xl">
      {/* Movie Info Banner */}
      <div className="border-b border-border bg-card px-4 py-6">
        <div className="flex gap-4">
          <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
              <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{movie.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {movie.rating} | {movie.language}
              {movie.duration ? ` | ${movie.duration}` : ""}
            </p>
            <Link
              href="#"
              className="mt-2 inline-block rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              View details
            </Link>
          </div>
        </div>
      </div>

      {/* Advisory */}
      <div className="flex items-start gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
          <span className="text-xs font-bold text-green-700">A</span>
        </div>
        <div>
          <p className="text-sm text-foreground">{'Movie suitable for adults (18+ years) only'}</p>
          <p className="text-sm text-muted-foreground">{'Please carry your IDs with birth date for verification'}</p>
        </div>
      </div>

      {/* Date Selector */}
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="flex items-end gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground" style={{ writingMode: "vertical-lr" }}>
            MAR
          </span>
          {dates.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDate(i)}
              className={`flex flex-col items-center rounded-lg px-3 py-1.5 transition-colors ${
                i === activeDate
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-lg font-bold">{d.day}</span>
              <span className="text-xs">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 border-b border-border bg-card px-4 py-3">
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
        {showFilters.map((f) => (
          <button
            key={f}
            onClick={() => toggleFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilters.includes(f)
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-foreground hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Theater List */}
      <div className="divide-y divide-border bg-card">
        {filteredTheaters.map((theater) => (
          <div key={theater.id} className="px-4 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                  <span className="text-[8px] font-bold uppercase text-foreground">{theater.logo}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{theater.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {theater.distance} | {theater.cancellable ? "Allows cancellation" : "Non-cancellable"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(theater.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Favorite ${theater.name}`}
              >
                <Heart
                  className="h-5 w-5"
                  fill={favorites.includes(theater.id) ? "currentColor" : "none"}
                  stroke={favorites.includes(theater.id) ? "hsl(0, 80%, 50%)" : "currentColor"}
                  style={favorites.includes(theater.id) ? { color: "hsl(0, 80%, 50%)" } : {}}
                />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {theater.showtimes.map((show, j) => (
                <Link
                  key={j}
                  href={`/movies/${theater.id}/seats?time=${encodeURIComponent(show.time)}`}
                  className="group rounded-lg border border-border px-5 py-2.5 text-center hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground group-hover:text-accent">
                    {show.time}
                  </span>
                  {show.format && (
                    <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Info className="h-3 w-3" />
                      {show.format}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
