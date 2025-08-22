"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import type { Product, StockMovement } from "@/types"

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function StockAdjustmentModal({ isOpen, onClose, product }: StockAdjustmentModalProps) {
  const { user } = useAuth()
  const { updateProduct, addStockMovement } = useDataStore()
  const [adjustmentType, setAdjustmentType] = useState<"in" | "out" | "adjustment">("adjustment")
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !user) return

    let newStock = product.stock
    let actualQuantity = quantity

    switch (adjustmentType) {
      case "in":
        newStock += quantity
        break
      case "out":
        newStock -= quantity
        actualQuantity = -quantity
        break
      case "adjustment":
        newStock = quantity
        actualQuantity = quantity - product.stock
        break
    }

    // Update product stock
    updateProduct(product.id, { stock: Math.max(0, newStock) })

    // Record stock movement
    const movement: Omit<StockMovement, "id" | "createdAt"> = {
      productId: product.id,
      type: adjustmentType,
      quantity: actualQuantity,
      reason,
      userId: user.id,
    }
    addStockMovement(movement)

    // Reset form and close
    setQuantity(0)
    setReason("")
    onClose()
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock - {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Current Stock:</div>
            <div className="text-2xl font-bold">{product.stock} units</div>
          </div>

          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Stock In (Add)</SelectItem>
                <SelectItem value="out">Stock Out (Remove)</SelectItem>
                <SelectItem value="adjustment">Set Exact Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{adjustmentType === "adjustment" ? "New Stock Level" : "Quantity"}</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
              placeholder="Enter quantity"
              required
            />
            {adjustmentType !== "adjustment" && (
              <div className="text-sm text-gray-500">
                New stock will be:{" "}
                {adjustmentType === "in" ? product.stock + quantity : Math.max(0, product.stock - quantity)} units
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for adjustment..."
              required
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Apply Adjustment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
