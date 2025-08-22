"use client"

import { useAuth } from "@/lib/auth-context"
import type { ReactNode } from "react"

interface PermissionGuardProps {
  children: ReactNode
  allowedRoles: ("admin" | "manager" | "cashier")[]
  fallback?: ReactNode
}

export function PermissionGuard({ children, allowedRoles, fallback }: PermissionGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-medium">Access Denied</div>
          <div className="text-red-600 text-sm">You don't have permission to view this content.</div>
        </div>
      )
    )
  }

  return <>{children}</>
}
