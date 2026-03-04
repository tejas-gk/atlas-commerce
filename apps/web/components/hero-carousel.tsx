"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { heroSlides } from "@/lib/data"

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = heroSlides[current]

  return (
    <div className="relative w-full overflow-hidden bg-foreground" style={{ minHeight: 380 }}>
      <div
        className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} transition-all duration-700`}
      />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-12 md:py-16">
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/20 p-2 text-primary-foreground backdrop-blur-sm hover:bg-card/40 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex flex-1 flex-col items-start justify-center gap-4 pl-10 pr-8">
          <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl text-balance">
            {slide.title}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            {slide.rating} | {slide.genre}
          </p>
          <Link
            href="/movies/assi"
            className="inline-flex items-center justify-center rounded-lg bg-card px-8 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            Book now
          </Link>
        </div>

        <div className="hidden flex-shrink-0 md:block">
          <div className="relative h-64 w-48 overflow-hidden rounded-xl shadow-2xl lg:h-72 lg:w-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <button
          onClick={next}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/20 p-2 text-primary-foreground backdrop-blur-sm hover:bg-card/40 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-6 bg-card" : "w-1.5 bg-card/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
