"use client"

import Link from "next/link"
import type { Movie } from "@/lib/data"

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block flex-shrink-0">
      <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[7/10] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
          {movie.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {movie.rating} | {movie.languages || movie.language}
        </p>
      </div>
    </Link>
  )
}
