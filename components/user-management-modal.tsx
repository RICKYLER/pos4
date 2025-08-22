"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/types"

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onSave: (userData: Omit<User, "id" | "createdAt"> | (User & { password?: string })) => void
}

export function UserManagementModal({ isOpen, onClose, user, onSave }: UserManagementModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || ("cashier" as "admin" | "manager" | "cashier"),
    password: "",
    isActive: user ? true : true, // New users are active by default
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (user) {
      // Editing existing user
      const updateData: User & { password?: string } = {
        ...user,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      onSave(updateData)
    } else {
      // Creating new user
      const newUserData: Omit<User, "id" | "createdAt"> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }
      onSave(newUserData)
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      role: "cashier",
      password: "",
      isActive: true,
    })
    onClose()
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value: any) => handleChange("role", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500">
              {formData.role === "cashier" && "Can access POS system only"}
              {formData.role === "manager" && "Can access POS, products, inventory, and sales"}
              {formData.role === "admin" && "Full system access including user management"}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{user ? "New Password (leave blank to keep current)" : "Password *"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={user ? "Enter new password" : "Enter password"}
              required={!user}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {user ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
