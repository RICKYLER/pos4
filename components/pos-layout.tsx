"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { LogOut, Menu, Settings, User } from "lucide-react"

interface PosLayoutProps {
  children: React.ReactNode
}

export function PosLayout({ children }: PosLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">POS Terminal</h1>
            <div className="hidden sm:block text-sm text-gray-500">
              Terminal #{Math.random().toString(36).substr(2, 6).toUpperCase()}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{user?.name}</span>
              <span className="text-gray-500 capitalize">({user?.role})</span>
            </div>

            <div className="flex items-center space-x-2">
              {(user?.role === "admin" || user?.role === "manager") && (
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Admin</span>
                  </a>
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={() => setMenuOpen(!menuOpen)}>
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-gray-200 bg-white p-4 sm:hidden">
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                Logged in as: <span className="font-medium">{user?.name}</span>
              </div>
              <div className="text-sm text-gray-500 capitalize">Role: {user?.role}</div>
              <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="p-4">{children}</main>

      {/* Quick Logout (Desktop) */}
      <div className="hidden sm:block fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
