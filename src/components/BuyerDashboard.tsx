'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Order, BoostOrder } from '@/types'
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, Truck, Gamepad2, Play, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function BuyerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [boostOrders, setBoostOrders] = useState<BoostOrder[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'boosts'>('products')

  useEffect(() => {
    if (!user) return
    
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const myOrders = allOrders.filter((o: Order) => o.buyerId === user.id)
    setOrders(myOrders.sort((a: Order, b: Order) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))

    const allBoostOrders = JSON.parse(localStorage.getItem('boostOrders') || '[]')
    const myBoostOrders = allBoostOrders.filter((o: BoostOrder) => o.buyerId === user.id)
    setBoostOrders(myBoostOrders.sort((a: BoostOrder, b: BoostOrder) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
  }, [user])

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
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': 
      case 'claimed': return 'bg-blue-100 text-blue-700'
      case 'shipped':
      case 'in_progress': return 'bg-purple-100 text-purple-700'
      case 'delivered':
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
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
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Boosts</p>
              <p className="text-2xl font-bold text-gray-900">{pendingBoosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedOrders + completedBoosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Shop Products</h2>
          <p className="text-primary-100 mb-4 text-sm">Browse our marketplace for amazing products.</p>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Browse Products</span>
          </Link>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Gaming Services</h2>
          <p className="text-purple-100 mb-4 text-sm">Get rank boosts, accounts, and more.</p>
          <Link
            href="/services"
            className="inline-flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Browse Services</span>
          </Link>
        </div>
      </div>

      {/* Orders Section with Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Product Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('boosts')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'boosts'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
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
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">You haven&apos;t placed any product orders yet.</p>
                <Link href="/products" className="text-primary-600 font-semibold hover:underline">
                  Start shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">{getStatusIcon(order.status)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.productTitle}</h3>
                          <p className="text-sm text-gray-500">Seller: {order.sellerName}</p>
                          <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                          <p className="text-lg font-bold text-primary-600 mt-2">${order.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            boostOrders.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">You haven&apos;t ordered any boosts yet.</p>
                <Link href="/services" className="text-purple-600 font-semibold hover:underline">
                  Browse services →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {boostOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">{getBoostStatusIcon(order.status)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.service.title}</h3>
                          <p className="text-sm text-gray-500 capitalize">{order.service.game.replace('_', ' ')}</p>
                          {order.boosterName && (
                            <p className="text-sm text-gray-500">Booster: {order.boosterName}</p>
                          )}
                          <p className="text-lg font-bold text-purple-600 mt-2">${order.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
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
