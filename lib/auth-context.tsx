"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types"
import { ApiService } from "./api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      if (typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("pos-user")
          const token = localStorage.getItem("pos-token")
          if (storedUser && token) {
            const parsedUser = JSON.parse(storedUser)
            setUser({
              ...parsedUser,
              createdAt: new Date(parsedUser.createdAt),
            })
          }
        } catch (error) {
          console.error("Error loading stored user:", error)
          localStorage.removeItem("pos-user")
          localStorage.removeItem("pos-token")
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await ApiService.login(email, password)
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role as "admin" | "manager" | "cashier",
        isActive: true,
        createdAt: new Date(response.user.created_at),
      }

      setUser(userData)
      localStorage.setItem("pos-user", JSON.stringify(userData))
      localStorage.setItem("pos-token", response.token)
      
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pos-user")
    localStorage.removeItem("pos-token")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
