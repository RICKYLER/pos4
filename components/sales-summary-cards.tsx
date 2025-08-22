"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, TrendingUp, Users, CreditCard } from "lucide-react"
import { useDataStore } from "@/lib/data-store"

export function SalesSummaryCards() {
  const { sales } = useDataStore()

  const metrics = useMemo(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todaySales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt)
      return saleDate.toDateString() === today.toDateString()
    })

    const yesterdaySales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt)
      return saleDate.toDateString() === yesterday.toDateString()
    })

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0)

    const totalTransactions = sales.length
    const todayTransactions = todaySales.length
    const yesterdayTransactions = yesterdaySales.length

    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    const uniqueCustomers = new Set(sales.filter((s) => s.customerId).map((s) => s.customerId)).size

    const revenueGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
    const transactionGrowth =
      yesterdayTransactions > 0 ? ((todayTransactions - yesterdayTransactions) / yesterdayTransactions) * 100 : 0

    // Payment method breakdown
    const paymentMethods = sales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostUsedPaymentMethod = Object.entries(paymentMethods).sort(([, a], [, b]) => b - a)[0]

    return {
      totalRevenue,
      todayRevenue,
      revenueGrowth,
      totalTransactions,
      todayTransactions,
      transactionGrowth,
      averageOrderValue,
      uniqueCustomers,
      mostUsedPaymentMethod: mostUsedPaymentMethod ? mostUsedPaymentMethod[0] : "N/A",
    }
  }, [sales])

  const cards = [
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toFixed(2)}`,
      subtitle: `Today: $${metrics.todayRevenue.toFixed(2)}`,
      change: metrics.revenueGrowth,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Transactions",
      value: metrics.totalTransactions.toString(),
      subtitle: `Today: ${metrics.todayTransactions}`,
      change: metrics.transactionGrowth,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Average Order Value",
      value: `$${metrics.averageOrderValue.toFixed(2)}`,
      subtitle: "Per transaction",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Unique Customers",
      value: metrics.uniqueCustomers.toString(),
      subtitle: "With customer ID",
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Top Payment Method",
      value: metrics.mostUsedPaymentMethod.charAt(0).toUpperCase() + metrics.mostUsedPaymentMethod.slice(1),
      subtitle: "Most popular",
      icon: CreditCard,
      color: "text-indigo-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                {card.change !== undefined && (
                  <span className={`text-xs font-medium ${card.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {card.change >= 0 ? "+" : ""}
                    {card.change.toFixed(1)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
