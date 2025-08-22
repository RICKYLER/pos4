"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { AdminLayout } from "@/components/admin-layout"
import { StockAdjustmentModal } from "@/components/stock-adjustment-modal"
import { StockMovementHistory } from "@/components/stock-movement-history"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, AlertTriangle, TrendingUp, DollarSign, Search, Edit, History } from "lucide-react"
import type { Product } from "@/types"

export default function InventoryPage() {
  const { user } = useAuth()
  const { products, categories } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      window.location.href = "/"
    }
  }, [user])

  if (!user) return null

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

    let matchesStock = true
    switch (stockFilter) {
      case "low":
        matchesStock = product.stock <= product.minStock
        break
      case "out":
        matchesStock = product.stock === 0
        break
      case "good":
        matchesStock = product.stock > product.minStock
        break
    }

    return matchesSearch && matchesCategory && matchesStock && product.isActive
  })

  const totalProducts = products.filter((p) => p.isActive).length
  const lowStockCount = products.filter((p) => p.isActive && p.stock <= p.minStock).length
  const outOfStockCount = products.filter((p) => p.isActive && p.stock === 0).length
  const totalValue = products.filter((p) => p.isActive).reduce((sum, product) => sum + product.stock * product.cost, 0)

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product)
    setShowAdjustmentModal(true)
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
    } else if (product.stock <= product.minStock) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    } else {
      return { label: "In Stock", color: "bg-green-100 text-green-800" }
    }
  }

  return (
    <AdminLayout currentPage="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">Monitor and manage your stock levels</p>
          </div>
          <Button onClick={() => setShowHistory(!showHistory)}>
            <History className="h-4 w-4 mr-2" />
            {showHistory ? "Hide History" : "View History"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
              <p className="text-xs text-muted-foreground">Urgent restock needed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total cost value</p>
            </CardContent>
          </Card>
        </div>

        {/* Stock Movement History */}
        {showHistory && <StockMovementHistory />}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="good">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory ({filteredProducts.length} products)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product)
                    const value = product.stock * product.cost

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-lg">{product.stock}</div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-500">{product.minStock}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">${value.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleAdjustStock(product)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">No products found matching your criteria.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Adjustment Modal */}
        <StockAdjustmentModal
          isOpen={showAdjustmentModal}
          onClose={() => setShowAdjustmentModal(false)}
          product={selectedProduct}
        />
      </div>
    </AdminLayout>
  )
}
