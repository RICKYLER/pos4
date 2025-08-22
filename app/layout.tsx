import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { DataStoreProvider } from "@/lib/data-store"

export const metadata: Metadata = {
  title: "POS System - Professional Point of Sale",
  description: "Complete POS system with inventory management, sales tracking, and customer management",
  // Removed: generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AuthProvider>
          <DataStoreProvider>{children}</DataStoreProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
