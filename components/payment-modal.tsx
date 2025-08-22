"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, DollarSign, Smartphone } from "lucide-react"
import type { Sale } from "@/types"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  saleData: Omit<Sale, "id" | "createdAt" | "paymentMethod">
  onPaymentComplete: (paymentMethod: "cash" | "card" | "digital") => void
}

export function PaymentModal({ isOpen, onClose, saleData, onPaymentComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital">("cash")
  const [cashReceived, setCashReceived] = useState(saleData.total)
  const [isProcessing, setIsProcessing] = useState(false)

  const change = cashReceived - saleData.total

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onPaymentComplete(paymentMethod)
    setIsProcessing(false)
  }

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: DollarSign },
    { id: "card", label: "Card", icon: CreditCard },
    { id: "digital", label: "Digital", icon: Smartphone },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${saleData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${saleData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-${saleData.discount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${saleData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <Button
                    key={method.id}
                    variant={paymentMethod === method.id ? "default" : "outline"}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className="flex flex-col gap-2 h-16"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{method.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === "cash" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cashReceived">Cash Received</Label>
                <Input
                  id="cashReceived"
                  type="number"
                  step="0.01"
                  min={saleData.total}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number.parseFloat(e.target.value) || 0)}
                  className="text-lg font-mono"
                />
              </div>

              {change >= 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700">Change to give:</div>
                  <div className="text-2xl font-bold text-green-800">${change.toFixed(2)}</div>
                </div>
              )}

              {change < 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-700">Insufficient cash received</div>
                </div>
              )}
            </div>
          )}

          {/* Card/Digital Payment Info */}
          {(paymentMethod === "card" || paymentMethod === "digital") && (
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-sm text-blue-700">
                {paymentMethod === "card"
                  ? "Insert, tap, or swipe card to complete payment"
                  : "Present QR code or NFC device to customer"}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || (paymentMethod === "cash" && change < 0)}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
