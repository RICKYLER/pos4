"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function CustomersPage() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      window.location.href = "/"
    }
  }, [user])

  if (!user) return null

  return (
    <AdminLayout currentPage="customers">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Customer management features will be available in the next update. This will include customer profiles,
              purchase history, loyalty programs, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
