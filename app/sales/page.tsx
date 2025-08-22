"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AdminLayout } from "@/components/admin-layout"
import { SalesSummaryCards } from "@/components/sales-summary-cards"
import { SalesChart } from "@/components/sales-chart"
import { SalesTransactionsTable } from "@/components/sales-transactions-table"

export default function SalesPage() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      window.location.href = "/"
    }
  }, [user])

  if (!user) return null

  return (
    <AdminLayout currentPage="sales">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600">Track your sales performance and analytics</p>
        </div>

        {/* Summary Cards */}
        <SalesSummaryCards />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart type="daily" title="Daily Revenue Trend (Last 7 Days)" />
          <SalesChart type="payment-methods" title="Payment Methods Breakdown" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <SalesChart type="top-products" title="Top 5 Products by Revenue" />
        </div>

        {/* Transactions Table */}
        <SalesTransactionsTable limit={10} />
      </div>
    </AdminLayout>
  )
}
