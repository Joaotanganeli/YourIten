'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole, GameCategory, AuthState, FixedService } from '@/types'

const AuthContext = createContext<AuthState | undefined>(undefined)

const DEFAULT_SERVICES: Omit<FixedService, 'id' | 'createdAt'>[] = [
  // League of Legends
  {
    game: 'league_of_legends',
    serviceType: 'rank_boost',
    title: 'LoL Rank Boost - Iron to Bronze',
    description: 'Professional boosting from Iron to Bronze rank',
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    details: { fromRank: 'Iron', toRank: 'Bronze' },
    isActive: true
  },
  {
    game: 'league_of_legends',
    serviceType: 'rank_boost',
    title: 'LoL Rank Boost - Bronze to Silver',
    description: 'Professional boosting from Bronze to Silver rank',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    details: { fromRank: 'Bronze', toRank: 'Silver' },
    isActive: true
  },
  {
    game: 'league_of_legends',
    serviceType: 'rank_boost',
    title: 'LoL Rank Boost - Silver to Gold',
    description: 'Professional boosting from Silver to Gold rank',
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    details: { fromRank: 'Silver', toRank: 'Gold' },
    isActive: true
  },
  {
    game: 'league_of_legends',
    serviceType: 'account',
    title: 'LoL Smurf Account - Level 30',
    description: 'Fresh Level 30 account ready for ranked',
    price: 20,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    details: { level: '30', region: 'Any' },
    isActive: true
  },
  {
    game: 'league_of_legends',
    serviceType: 'gold',
    title: 'LoL Blue Essence - 50,000 BE',
    description: '50,000 Blue Essence for champions',
    price: 10,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    details: { amount: '50000' },
    isActive: true
  },
  // Valorant
  {
    game: 'valorant',
    serviceType: 'rank_boost',
    title: 'Valorant Rank Boost - Iron to Bronze',
    description: 'Professional boosting from Iron to Bronze rank',
    price: 20,
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
    details: { fromRank: 'Iron', toRank: 'Bronze' },
    isActive: true
  },
  {
    game: 'valorant',
    serviceType: 'rank_boost',
    title: 'Valorant Rank Boost - Bronze to Silver',
    description: 'Professional boosting from Bronze to Silver rank',
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
    details: { fromRank: 'Bronze', toRank: 'Silver' },
    isActive: true
  },
  {
    game: 'valorant',
    serviceType: 'rank_boost',
    title: 'Valorant Rank Boost - Silver to Gold',
    description: 'Professional boosting from Silver to Gold rank',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
    details: { fromRank: 'Silver', toRank: 'Gold' },
    isActive: true
  },
  {
    game: 'valorant',
    serviceType: 'account',
    title: 'Valorant Smurf Account',
    description: 'Fresh account ready for competitive',
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    details: { level: 'Ranked Ready' },
    isActive: true
  },
  {
    game: 'valorant',
    serviceType: 'gold',
    title: 'Valorant Points - 1000 VP',
    description: '1000 Valorant Points for skins',
    price: 12,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    details: { amount: '1000' },
    isActive: true
  },
  // Deadlock
  {
    game: 'deadlock',
    serviceType: 'rank_boost',
    title: 'Deadlock Rank Boost - Initiate to Seeker',
    description: 'Professional boosting from Initiate to Seeker rank',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0b?w=400',
    details: { fromRank: 'Initiate', toRank: 'Seeker' },
    isActive: true
  },
  {
    game: 'deadlock',
    serviceType: 'rank_boost',
    title: 'Deadlock Rank Boost - Seeker to Archon',
    description: 'Professional boosting from Seeker to Archon rank',
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0b?w=400',
    details: { fromRank: 'Seeker', toRank: 'Archon' },
    isActive: true
  },
  {
    game: 'deadlock',
    serviceType: 'account',
    title: 'Deadlock Account - Ranked Ready',
    description: 'Account ready for ranked matches',
    price: 18,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    details: { level: 'Ranked Ready' },
    isActive: true
  },
  {
    game: 'deadlock',
    serviceType: 'gold',
    title: 'Deadlock Souls - 10,000',
    description: '10,000 Souls for upgrades',
    price: 8,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    details: { amount: '10000' },
    isActive: true
  }
]

function initializeDefaultServices() {
  const existingServices = localStorage.getItem('fixedServices')
  if (!existingServices) {
    const services: FixedService[] = DEFAULT_SERVICES.map(s => ({
      ...s,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }))
    localStorage.setItem('fixedServices', JSON.stringify(services))
  }
}

function initializeAdminUser() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const adminExists = users.some((u: User) => u.role === 'admin')
  
  if (!adminExists) {
    const adminUser = {
      id: crypto.randomUUID(),
      email: 'admin@youriten.com',
      password: 'admin123',
      name: 'Master Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
    users.push(adminUser)
    localStorage.setItem('users', JSON.stringify(users))
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeDefaultServices()
    initializeAdminUser()
    
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const foundUser = users.find((u: User & { password: string }) => 
        u.email === email && u.password === password
      )
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        localStorage.setItem('user', JSON.stringify(userWithoutPassword))
        return true
      }
      return false
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
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      if (users.some((u: User) => u.email === email)) {
        return false
      }

      const newUser: User & { password: string } = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        role,
        gameCategories: role === 'booster' ? gameCategories : undefined,
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))

      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      
      return true
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
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
