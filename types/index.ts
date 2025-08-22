// Core data types for the POS system
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "manager" | "cashier"
  isActive: boolean
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  cost: number
  sku: string
  barcode?: string
  category: string
  stock: number
  minStock: number
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface Sale {
  id: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "card" | "digital"
  cashierId: string
  customerId?: string
  createdAt: Date
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  totalPurchases: number
  createdAt: Date
}

export interface StockMovement {
  id: string
  productId: string
  type: "in" | "out" | "adjustment"
  quantity: number
  reason: string
  userId: string
  createdAt: Date
}
