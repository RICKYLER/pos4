"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { PosLayout } from "@/components/pos-layout"
import { ProductSearch } from "@/components/product-search"
import { ShoppingCartComponent } from "@/components/shopping-cart"
import { PaymentModal } from "@/components/payment-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import type { Product, SaleItem, Sale } from "@/types"

export default function PosPage() {
  const { user } = useAuth()
  const { addSale } = useDataStore()
  const [cartItems, setCartItems] = useState<SaleItem[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)

  useEffect(() => {
    if (!user) {
      window.location.href = "/"
    }
  }, [user])

  if (!user) return null

  const handleProductSelect = (product: Product) => {
    const existingItem = cartItems.find((item) => item.productId === product.id)

    if (existingItem) {
      handleUpdateQuantity(product.id, existingItem.quantity + 1)
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
      }
      setCartItems((prev) => [...prev, newItem])
    }
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId)
      return
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity, total: item.unitPrice * quantity } : item,
      ),
    )
  }

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    setShowPaymentModal(true)
  }

  const handlePaymentComplete = (paymentMethod: "cash" | "card" | "digital") => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.08
    const discount = 0 // Could be calculated from cart state
    const total = subtotal + tax - discount

    const saleData: Omit<Sale, "id" | "createdAt"> = {
      items: cartItems,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      cashierId: user.id,
    }

    addSale(saleData)

    const completedSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    setLastSale(completedSale)
    setCartItems([])
    setShowPaymentModal(false)
    setShowSuccessMessage(true)

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <PosLayout>
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccessMessage && lastSale && (
          <Card className="mb-4 border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Sale completed successfully!</div>
                  <div className="text-sm text-green-600">
                    Transaction #{lastSale.id.slice(-6)} - ${lastSale.total.toFixed(2)} ({lastSale.paymentMethod})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Search</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductSearch onProductSelect={handleProductSelect} />
              </CardContent>
            </Card>
          </div>

          {/* Shopping Cart - Takes up 1 column */}
          <div className="lg:col-span-1">
            <ShoppingCartComponent
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => setCartItems([])} disabled={cartItems.length === 0}>
            Clear Cart
          </Button>

          {(user.role === "admin" || user.role === "manager") && (
            <Button variant="outline" asChild>
              <a href="/dashboard">Admin Dashboard</a>
            </Button>
          )}
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          saleData={{
            items: cartItems,
            subtotal,
            tax,
            discount: 0,
            total,
            cashierId: user.id,
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </PosLayout>
  )
}
