"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, Category, Sale, Customer, StockMovement, User } from "@/types"
import { apiService } from "@/lib/api"

interface DataStoreContextType {
  // Products
  products: Product[]
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void

  // Categories
  categories: Category[]
  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (id: string, updates: Partial<Category>) => void

  // Sales
  sales: Sale[]
  addSale: (sale: Omit<Sale, "id" | "createdAt">) => void

  // Customers
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void

  // Stock movements
  stockMovements: StockMovement[]
  addStockMovement: (movement: Omit<StockMovement, "id" | "createdAt">) => void

  // Users
  users: User[]
  addUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (id: string, updates: Partial<User>) => void
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

// Mock initial data
const initialCategories: Category[] = [
  { id: "1", name: "Electronics", description: "Electronic devices and accessories", isActive: true },
  { id: "2", name: "Clothing", description: "Apparel and fashion items", isActive: true },
  { id: "3", name: "Food & Beverages", description: "Food items and drinks", isActive: true },
  { id: "4", name: "Books", description: "Books and publications", isActive: true },
]

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 99.99,
    cost: 60.0,
    sku: "WH001",
    barcode: "1234567890123",
    category: "Electronics",
    stock: 25,
    minStock: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Cotton T-Shirt",
    description: "Comfortable cotton t-shirt in various colors",
    price: 19.99,
    cost: 8.0,
    sku: "TS001",
    category: "Clothing",
    stock: 50,
    minStock: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Coffee Beans",
    description: "Premium arabica coffee beans - 1lb bag",
    price: 12.99,
    cost: 6.5,
    sku: "CB001",
    category: "Food & Beverages",
    stock: 30,
    minStock: 8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const initialStockMovements: StockMovement[] = [
  {
    id: "1",
    productId: "1",
    type: "in",
    quantity: 50,
    reason: "Initial stock",
    userId: "1",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: "2",
    productId: "2",
    type: "in",
    quantity: 100,
    reason: "New shipment received",
    userId: "1",
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
  },
  {
    id: "3",
    productId: "1",
    type: "out",
    quantity: -25,
    reason: "Sales",
    userId: "2",
    createdAt: new Date(Date.now() - 21600000), // 6 hours ago
  },
]

const initialSales: Sale[] = [
  {
    id: "1",
    items: [
      { productId: "1", productName: "Wireless Headphones", quantity: 1, unitPrice: 99.99, total: 99.99 },
      { productId: "2", productName: "Cotton T-Shirt", quantity: 2, unitPrice: 19.99, total: 39.98 },
    ],
    subtotal: 139.97,
    tax: 11.2,
    discount: 0,
    total: 151.17,
    paymentMethod: "card",
    cashierId: "3",
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
  },
  {
    id: "2",
    items: [{ productId: "3", productName: "Coffee Beans", quantity: 3, unitPrice: 12.99, total: 38.97 }],
    subtotal: 38.97,
    tax: 3.12,
    discount: 0,
    total: 42.09,
    paymentMethod: "cash",
    cashierId: "3",
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: "3",
    items: [{ productId: "1", productName: "Wireless Headphones", quantity: 2, unitPrice: 99.99, total: 199.98 }],
    subtotal: 199.98,
    tax: 16.0,
    discount: 10.0,
    total: 205.98,
    paymentMethod: "digital",
    cashierId: "2",
    createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
  },
  {
    id: "4",
    items: [
      { productId: "2", productName: "Cotton T-Shirt", quantity: 1, unitPrice: 19.99, total: 19.99 },
      { productId: "3", productName: "Coffee Beans", quantity: 1, unitPrice: 12.99, total: 12.99 },
    ],
    subtotal: 32.98,
    tax: 2.64,
    discount: 0,
    total: 35.62,
    paymentMethod: "card",
    cashierId: "3",
    createdAt: new Date(Date.now() - 900000), // 15 minutes ago
  },
]

const initialUsers: User[] = [
  {
    id: "1",
    email: "admin@pos.com",
    name: "Admin User",
    role: "admin",
    isActive: true,
    createdAt: new Date(Date.now() - 2592000000), // 30 days ago
  },
  {
    id: "2",
    email: "manager@pos.com",
    name: "Store Manager",
    role: "manager",
    isActive: true,
    createdAt: new Date(Date.now() - 1296000000), // 15 days ago
  },
  {
    id: "3",
    email: "cashier@pos.com",
    name: "Cashier",
    role: "cashier",
    isActive: true,
    createdAt: new Date(Date.now() - 604800000), // 7 days ago
  },
]

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements)
  const [users, setUsers] = useState<User[]>(initialUsers)

  const addProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...updates, updatedAt: new Date() } : product)),
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const addCategory = (categoryData: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...updates } : category)))
  }

  const addSale = (saleData: Omit<Sale, "id" | "createdAt">) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setSales((prev) => [...prev, newSale])

    // Update product stock
    saleData.items.forEach((item) => {
      updateProduct(item.productId, {
        stock: products.find((p) => p.id === item.productId)!.stock - item.quantity,
      })
    })
  }

  const addCustomer = (customerData: Omit<Customer, "id" | "createdAt">) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setCustomers((prev) => [...prev, newCustomer])
  }

  const addStockMovement = (movementData: Omit<StockMovement, "id" | "createdAt">) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setStockMovements((prev) => [...prev, newMovement])
  }

  const addUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updates } : user)))
  }

  // Load products from backend on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiService.getProducts()
        if (response.products) {
          setProducts(response.products)
        }
      } catch (err) {
        console.warn('Failed to load products from backend, using mock data:', err)
        setError('Failed to connect to backend')
        // Keep using mock data as fallback
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const addProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await apiService.createProduct(product)
      // Add to local state
      const newProduct: Product = {
        ...product,
        id: response.id || Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setProducts(prev => [...prev, newProduct])
    } catch (err) {
      console.error('Failed to create product:', err)
      // Fallback to local-only creation
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setProducts(prev => [...prev, newProduct])
    }
  }

  return (
    <DataStoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        sales,
        addSale,
        customers,
        addCustomer,
        stockMovements,
        addStockMovement,
        users,
        addUser,
        updateUser,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (context === undefined) {
    throw new Error("useDataStore must be used within a DataStoreProvider")
  }
  return context
}
