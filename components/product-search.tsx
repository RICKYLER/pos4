"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Scan } from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import type { Product } from "@/types"

interface ProductSearchProps {
  onProductSelect: (product: Product) => void
}

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const { products, categories } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    const filtered = products.filter((product) => {
      if (!product.isActive) return false

      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm)

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    setFilteredProducts(filtered.slice(0, 20)) // Limit to 20 results for performance
  }, [products, searchTerm, selectedCategory])

  const handleBarcodeSearch = () => {
    // In a real app, this would trigger barcode scanner
    const barcode = prompt("Enter barcode:")
    if (barcode) {
      setSearchTerm(barcode)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by product name, SKU, or scan barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-lg py-3"
            autoFocus
          />
        </div>
        <Button variant="outline" onClick={handleBarcodeSearch} className="px-3 bg-transparent">
          <Scan className="h-5 w-5" />
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.name ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.name)}
            className="whitespace-nowrap"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Product Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onProductSelect(product)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="font-medium text-sm line-clamp-2">{product.name}</div>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  <span className="font-bold text-lg text-green-600">${product.price.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  SKU: {product.sku} | Stock: {product.stock}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {searchTerm && filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">No products found matching "{searchTerm}"</div>
      )}
    </div>
  )
}
