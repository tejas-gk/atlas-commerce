"use client"

import * as React from "react"
import { authApi } from "@/lib/auth-api"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = React.useState(true)
  const [pathname, setPathname] = React.useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const updatePathname = () => setPathname(window.location.pathname)
    window.addEventListener("popstate", updatePathname)

    return () => window.removeEventListener("popstate", updatePathname)
  }, [])

  React.useEffect(() => {
    if (pathname === "/login") {
      setIsChecking(false)
      return
    }

    let isMounted = true

    const loadSession = async () => {
      try {
        await authApi.getLoggedInSeller()
        if (!isMounted) return

        setIsChecking(false)
      } catch {
        if (!isMounted) return

        window.location.replace("/login")
      }
    }

    loadSession()

    return () => {
      isMounted = false
    }
  }, [pathname])

  React.useEffect(() => {
    if (pathname !== "/login" || isChecking) {
      return
    }

    let isMounted = true

    const loadSeller = async () => {
      try {
        await authApi.getLoggedInSeller()
        if (!isMounted) return

        window.location.replace("/dashboard")
      } catch {
        if (!isMounted) return
      }
    }

    loadSeller()

    return () => {
      isMounted = false
    }
  }, [isChecking, pathname])

  if (pathname !== "/login" && isChecking) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted-foreground">
        Checking your seller session...
      </div>
    )
  }

  return <>{children}</>
}
