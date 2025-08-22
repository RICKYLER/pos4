"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { AdminLayout } from "@/components/admin-layout"
import { UserManagementModal } from "@/components/user-management-modal"
import { PermissionGuard } from "@/components/permission-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Shield, Users, SettingsIcon } from "lucide-react"
import type { User } from "@/types"

export default function SettingsPage() {
  const { user: currentUser } = useAuth()
  const { users, addUser, updateUser } = useDataStore()
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (!currentUser) {
      window.location.href = "/"
    }
  }, [currentUser])

  if (!currentUser) return null

  const handleAddUser = () => {
    setSelectedUser(null)
    setShowUserModal(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleSaveUser = (userData: any) => {
    if (selectedUser) {
      updateUser(selectedUser.id, userData)
    } else {
      addUser(userData)
    }
  }

  const handleToggleUserStatus = (userId: string, isActive: boolean) => {
    updateUser(userId, { isActive })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "cashier":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "admin":
        return "Full system access, user management, all reports"
      case "manager":
        return "POS, products, inventory, sales reports"
      case "cashier":
        return "POS system access only"
      default:
        return "No permissions"
    }
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage system settings and user permissions</p>
        </div>

        {/* User Management Section */}
        <PermissionGuard allowedRoles={["admin"]}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <Button onClick={handleAddUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-gray-600 truncate">{getRolePermissions(user.role)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={(checked) => handleToggleUserStatus(user.id, checked)}
                              disabled={user.id === currentUser.id} // Can't deactivate self
                            />
                            <span className="text-sm">{user.isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Role Permissions Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-red-100 text-red-800">Administrator</Badge>
                </div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Full system access</li>
                  <li>• User management</li>
                  <li>• All reports and analytics</li>
                  <li>• System settings</li>
                  <li>• Product management</li>
                  <li>• Inventory control</li>
                  <li>• POS access</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
                </div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Product management</li>
                  <li>• Inventory control</li>
                  <li>• Sales reports</li>
                  <li>• POS access</li>
                  <li>• Stock adjustments</li>
                  <li>• Sales analytics</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-green-100 text-green-800">Cashier</Badge>
                </div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• POS system access</li>
                  <li>• Process sales</li>
                  <li>• View product information</li>
                  <li>• Handle payments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">System Version:</span>
                  <span className="text-sm text-gray-600">v2.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Users:</span>
                  <span className="text-sm text-gray-600">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Active Users:</span>
                  <span className="text-sm text-gray-600">{users.filter((u) => u.isActive).length}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Current User:</span>
                  <span className="text-sm text-gray-600">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Your Role:</span>
                  <Badge className={getRoleBadgeColor(currentUser.role)}>
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Last Login:</span>
                  <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management Modal */}
        <UserManagementModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          user={selectedUser}
          onSave={handleSaveUser}
        />
      </div>
    </AdminLayout>
  )
}
