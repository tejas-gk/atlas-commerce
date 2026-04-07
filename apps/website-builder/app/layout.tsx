import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthGuard } from "@/components/auth/auth-guard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Penderghast - Website Builder",
  description: "Build stunning websites without code",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <AuthGuard> */}
          {children}
        {/* </AuthGuard> */}
      </body>
    </html>
  )
}
