"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { authApi, type SellerAuthRecord } from "@/lib/auth-api"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(pathname !== "/login")
  const [seller, setSeller] = useState<SellerAuthRecord | null>(null)

  useEffect(() => {
    if (pathname === "/login") {
      setIsChecking(false)
      return
    }

    let isMounted = true

    const loadSession = async () => {
      try {
        const response = await authApi.getLoggedInSeller()

        if (!isMounted) return

        setSeller(response.seller)
        setIsChecking(false)
      } catch {
        if (!isMounted) return

        router.replace("/login")
      }
    }

    loadSession()

    return () => {
      isMounted = false
    }
  }, [pathname, router])

  useEffect(() => {
    if (pathname !== "/login" || isChecking) {
      return
    }

    let isMounted = true

    const loadSeller = async () => {
      try {
        const response = await authApi.getLoggedInSeller()

        if (!isMounted) return

        setSeller(response.seller)
        router.replace("/dashboard")
      } catch {
        if (!isMounted) return

        setSeller(null)
      }
    }

    loadSeller()

    return () => {
      isMounted = false
    }
  }, [isChecking, pathname, router])

  if (pathname !== "/login" && isChecking) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted-foreground">
        Checking your seller session...
      </div>
    )
  }

  return <>{children}</>
}
