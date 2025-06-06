"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Simple user type
interface SimpleUser {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: SimpleUser | null
  loading: boolean
  error: string | null
  signIn: () => void
  signOut: () => void
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: () => {},
  signOut: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for saved user on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("quantprep_user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (err) {
      console.error("Error loading saved user:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Simple sign in function - just creates a mock user
  const signIn = () => {
    const mockUser = {
      id: `user-${Date.now()}`,
      email: "demo@example.com",
      name: "Demo User",
    }

    setUser(mockUser)

    try {
      localStorage.setItem("quantprep_user", JSON.stringify(mockUser))
    } catch (err) {
      console.error("Error saving user:", err)
    }
  }

  // Simple sign out function
  const signOut = () => {
    setUser(null)
    try {
      localStorage.removeItem("quantprep_user")
    } catch (err) {
      console.error("Error removing user:", err)
    }
  }

  return <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
