"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { StoreProvider } from "@/context/cart-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="light"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <StoreProvider>
        {children}
      </StoreProvider>
    </NextThemesProvider>
  )
}
