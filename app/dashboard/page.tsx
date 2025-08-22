"use client"

import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { products, sales } = useDataStore()

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      window.location.href = "/"
    }
  }, [user])

  if (!user) return null

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock)
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalProducts = products.length
  const totalSales = sales.length

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active products in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">Completed transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total sales revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">Products need restocking</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-sm text-red-600">
                      {product.stock} left (min: {product.minStock})
                    </span>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-red-600">...and {lowStockProducts.length - 5} more</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a
                href="/products/new"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add New Product
              </a>
              <a
                href="/pos"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Open POS
              </a>
              <a
                href="/inventory"
                className="block w-full bg-orange-600 text-white text-center py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                Manage Inventory
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length > 0 ? (
                <div className="space-y-3">
                  {sales
                    .slice(-5)
                    .reverse()
                    .map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center text-sm">
                        <span>Sale #{sale.id.slice(-4)}</span>
                        <span className="font-medium">${sale.total.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent sales</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
