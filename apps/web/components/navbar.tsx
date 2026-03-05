"use client"

import Link from "next/link"
import { Search, MapPin } from "lucide-react"
import { navItems } from "@/lib/data"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Navbars() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  function getActiveTab() {
    if (pathname === "/" || pathname.startsWith("/movies")) return "Movies"
    if (pathname.startsWith("/events")) return "Events"
    if (pathname.startsWith("/play")) return "Play"
    return "Movies"
  }

  const activeTab = getActiveTab()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
        <Link href="/" className="mr-4 flex-shrink-0">
          <span className="text-xl font-black tracking-tighter text-foreground" style={{ fontFamily: "serif" }}>
            district
          </span>
          <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">by zomato</span>
        </Link>

        <div className="mr-6 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-accent" />
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">Gurugram</p>
            <p className="text-xs text-muted-foreground">Haryana</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === item.label
                  ? "border border-foreground bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            T
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-card px-4 py-3">
          <div className="mx-auto max-w-7xl">
            <input
              type="text"
              placeholder="Search for movies, events, activities..."
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
