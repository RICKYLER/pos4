"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import type { SaleItem } from "@/types"

interface ShoppingCartProps {
  items: SaleItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onCheckout: () => void
}

export function ShoppingCartComponent({ items, onUpdateQuantity, onRemoveItem, onCheckout }: ShoppingCartProps) {
  const [discount, setDiscount] = useState(0)

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.08 // 8% tax rate
  const total = subtotal + tax - discount

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart ({items.length} items)
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Cart Items */}
        <div className="flex-1 space-y-3 max-h-64 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Cart is empty</p>
              <p className="text-sm">Scan or search for products to add</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.productName}</div>
                  <div className="text-xs text-gray-500">${item.unitPrice.toFixed(2)} each</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <Input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.productId, Number.parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-center text-sm"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="text-right">
                  <div className="font-medium">${item.total.toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.productId)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        {items.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount:</span>
                <Input
                  type="number"
                  min="0"
                  max={subtotal}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                  className="w-20 h-6 text-xs text-right"
                  placeholder="0.00"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Button onClick={onCheckout} className="w-full" size="lg">
              Checkout - ${total.toFixed(2)}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
