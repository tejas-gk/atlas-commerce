"use client"

import { FilterChips } from "@/components/filter-chips"

export function MoviesFilterSection() {
  return (
    <FilterChips
      filters={["English", "Hindi", "New Releases", "4DX-2D", "3D"]}
    />
  )
}
