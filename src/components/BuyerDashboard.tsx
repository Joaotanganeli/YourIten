'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Order, BoostOrder } from '@/types'
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, Truck, Gamepad2, Play, Trophy } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'

export default function BuyerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [boostOrders, setBoostOrders] = useState<BoostOrder[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'boosts'>('products')

  useEffect(() => {
    if (!user) return
    loadOrders()
  }, [user])

  const loadOrders = async () => {
    try {
      const [ordersData, boostOrdersData] = await Promise.all([
        apiClient.orders.list('buyer'),
        apiClient.boostOrders.list({ role: 'buyer' })
      ])
      setOrders(ordersData)
      setBoostOrders(boostOrdersData)
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />
      case 'delivered': return <Package className="h-5 w-5 text-green-500" />
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getBoostStatusIcon = (status: BoostOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'claimed': return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'in_progress': return <Play className="h-5 w-5 text-purple-500" />
      case 'completed': return <Trophy className="h-5 w-5 text-green-500" />
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'confirmed': 
      case 'claimed': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'shipped':
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      case 'delivered':
      case 'completed': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default: return 'bg-dark-700 text-dark-300'
    }
  }

  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'delivered').length
  const pendingBoosts = boostOrders.filter(o => o.status === 'pending' || o.status === 'claimed' || o.status === 'in_progress').length
  const completedBoosts = boostOrders.filter(o => o.status === 'completed').length
  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0) +
    boostOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0)

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Pending Orders</p>
              <p className="text-2xl font-bold text-white">{pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Active Boosts</p>
              <p className="text-2xl font-bold text-white">{pendingBoosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Completed</p>
              <p className="text-2xl font-bold text-white">{completedOrders + completedBoosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Spent</p>
              <p className="text-2xl font-bold text-primary-400">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-800 rounded-xl p-6 border border-primary-500/30 glow-green-sm">
          <h2 className="text-xl font-bold text-white mb-2">Shop Products</h2>
          <p className="text-dark-400 mb-4 text-sm">Browse our marketplace for amazing products.</p>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-primary-500 text-dark-900 px-4 py-2 rounded-lg font-bold hover:bg-primary-400 transition-colors text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Browse Products</span>
          </Link>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-purple-500/30">
          <h2 className="text-xl font-bold text-white mb-2">Gaming Services</h2>
          <p className="text-dark-400 mb-4 text-sm">Get rank boosts, accounts, and more.</p>
          <Link
            href="/services"
            className="inline-flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-400 transition-colors text-sm"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Browse Services</span>
          </Link>
        </div>
      </div>

      {/* Orders Section with Tabs */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="border-b border-dark-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/10'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              Product Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('boosts')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'boosts'
                  ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              Boost Orders ({boostOrders.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'products' ? (
            orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 mb-4">You haven&apos;t placed any product orders yet.</p>
                <Link href="/products" className="text-primary-400 font-semibold hover:underline">
                  Start shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-dark-700 rounded-lg p-4 hover:border-dark-600 transition-colors bg-dark-800/50">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">{getStatusIcon(order.status)}</div>
                        <div>
                          <h3 className="font-semibold text-white">{order.productTitle}</h3>
                          <p className="text-sm text-dark-400">Seller: {order.sellerName}</p>
                          <p className="text-sm text-dark-400">Quantity: {order.quantity}</p>
                          <p className="text-lg font-bold text-primary-400 mt-2">${order.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <p className="text-xs text-dark-500 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            boostOrders.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 mb-4">You haven&apos;t ordered any boosts yet.</p>
                <Link href="/services" className="text-purple-400 font-semibold hover:underline">
                  Browse services →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {boostOrders.map(order => (
                  <div key={order.id} className="border border-dark-700 rounded-lg p-4 hover:border-dark-600 transition-colors bg-dark-800/50">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">{getBoostStatusIcon(order.status)}</div>
                        <div>
                          <h3 className="font-semibold text-white">{order.service.title}</h3>
                          <p className="text-sm text-dark-400 capitalize">{order.service.game.replace('_', ' ')}</p>
                          {order.boosterName && (
                            <p className="text-sm text-dark-400">Booster: {order.boosterName}</p>
                          )}
                          <p className="text-lg font-bold text-purple-400 mt-2">${order.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                        </span>
                        <p className="text-xs text-dark-500 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
