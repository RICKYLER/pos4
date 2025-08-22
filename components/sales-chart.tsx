"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { useDataStore } from "@/lib/data-store"

interface SalesChartProps {
  type: "daily" | "weekly" | "monthly" | "payment-methods" | "top-products"
  title: string
}

export function SalesChart({ type, title }: SalesChartProps) {
  const { sales, products } = useDataStore()

  const chartData = useMemo(() => {
    switch (type) {
      case "daily": {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split("T")[0]
        }).reverse()

        return last7Days.map((date) => {
          const daySales = sales.filter((sale) => sale.createdAt.toISOString().split("T")[0] === date)
          const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0)
          const transactions = daySales.length

          return {
            date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            revenue: Number(revenue.toFixed(2)),
            transactions,
          }
        })
      }

      case "payment-methods": {
        const methods = sales.reduce(
          (acc, sale) => {
            acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total
            return acc
          },
          {} as Record<string, number>,
        )

        return Object.entries(methods).map(([method, total]) => ({
          method: method.charAt(0).toUpperCase() + method.slice(1),
          total: Number(total.toFixed(2)),
          count: sales.filter((s) => s.paymentMethod === method).length,
        }))
      }

      case "top-products": {
        const productSales = sales.reduce(
          (acc, sale) => {
            sale.items.forEach((item) => {
              if (!acc[item.productId]) {
                acc[item.productId] = {
                  name: item.productName,
                  quantity: 0,
                  revenue: 0,
                }
              }
              acc[item.productId].quantity += item.quantity
              acc[item.productId].revenue += item.total
            })
            return acc
          },
          {} as Record<string, { name: string; quantity: number; revenue: number }>,
        )

        return Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
          .map((product) => ({
            name: product.name.length > 20 ? product.name.substring(0, 20) + "..." : product.name,
            quantity: product.quantity,
            revenue: Number(product.revenue.toFixed(2)),
          }))
      }

      default:
        return []
    }
  }, [sales, products, type])

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    transactions: {
      label: "Transactions",
      color: "hsl(var(--chart-2))",
    },
    quantity: {
      label: "Quantity Sold",
      color: "hsl(var(--chart-3))",
    },
  }

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {type === "daily" && (
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
              </LineChart>
            )}

            {type === "payment-methods" && (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, total }) => `${method}: $${total}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            )}

            {type === "top-products" && (
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
