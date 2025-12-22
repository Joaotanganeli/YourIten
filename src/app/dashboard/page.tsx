'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SellerDashboard from '@/components/SellerDashboard'
import BuyerDashboard from '@/components/BuyerDashboard'
import BoosterDashboard from '@/components/BoosterDashboard'
import AdminDashboard from '@/components/AdminDashboard'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleDescription = () => {
    switch (user.role) {
      case 'seller': return 'Manage your products and orders'
      case 'buyer': return 'Browse products and track your orders'
      case 'booster': return 'Claim and complete boost orders'
      case 'admin': return 'Manage services and monitor all activity'
      default: return ''
    }
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'seller': return <SellerDashboard />
      case 'buyer': return <BuyerDashboard />
      case 'booster': return <BoosterDashboard />
      case 'admin': return <AdminDashboard />
      default: return <BuyerDashboard />
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome, <span className="text-primary-400">{user.name}</span>!
          </h1>
          <p className="text-dark-400 mt-1">{getRoleDescription()}</p>
        </div>

        {renderDashboard()}
      </div>
    </div>
  )
}
