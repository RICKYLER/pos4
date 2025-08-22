"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { LoadingScreen } from "@/components/loading-spinner"
import dynamic from "next/dynamic"

const DashboardPage = dynamic(() => import("@/app/dashboard/page"), { ssr: false })
const POSPage = dynamic(() => import("@/app/pos/page"), { ssr: false })

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen message="Initializing POS System..." />
  }

  if (!user) {
    return <LoginForm />
  }

  if (user.role === "admin" || user.role === "manager") {
    return <DashboardPage />
  } else if (user.role === "cashier") {
    return <POSPage />
  }

  return <LoadingScreen message="Loading..." />
}
