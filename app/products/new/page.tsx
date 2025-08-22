"use client"

import { useAuth } from "@/lib/auth-context"
import { AdminLayout } from "@/components/admin-layout"
import { ProductForm } from "@/components/product-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function NewProductPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      router.replace("/")
    }
  }, [user, router])

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return null
  }

  const handleSave = () => {
    router.push("/products")
  }

  const handleCancel = () => {
    router.push("/products")
  }

  return (
    <AdminLayout currentPage="products">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product in your catalog</p>
        </div>

        <ProductForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </AdminLayout>
  )
}
