'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole, GameCategory, AuthState } from '@/types'
import { apiClient } from '@/lib/api-client'

const AuthContext = createContext<AuthState | undefined>(undefined)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('auth_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.auth.login(email, password)
      const { user: userData, token } = response
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('auth_token', token)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole,
    gameCategories?: GameCategory[]
  ): Promise<boolean> => {
    try {
      const response = await apiClient.auth.register(email, password, name, role, gameCategories)
      const { user: userData, token } = response
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('auth_token', token)
      return true
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
