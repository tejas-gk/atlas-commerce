"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"

interface FilterChipsProps {
  filters: string[]
  onFilterChange?: (active: string[]) => void
}

export function FilterChips({ filters, onFilterChange }: FilterChipsProps) {
  const [active, setActive] = useState<string[]>([])

  function toggle(f: string) {
    const next = active.includes(f)
      ? active.filter((x) => x !== f)
      : [...active, f]
    setActive(next)
    onFilterChange?.(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </button>
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => toggle(f)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            active.includes(f)
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card text-foreground hover:bg-secondary"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
