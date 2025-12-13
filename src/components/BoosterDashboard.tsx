'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { BoostOrder, GameCategory } from '@/types'
import { 
  Gamepad2, Bell, CheckCircle, Clock, Play, Trophy, 
  Swords, Crosshair, Target, DollarSign, AlertCircle
} from 'lucide-react'

const GAME_LABELS: Record<GameCategory, { name: string; icon: React.ReactNode; color: string }> = {
  league_of_legends: { name: 'League of Legends', icon: <Swords className="h-5 w-5" />, color: 'blue' },
  valorant: { name: 'Valorant', icon: <Crosshair className="h-5 w-5" />, color: 'red' },
  deadlock: { name: 'Deadlock', icon: <Target className="h-5 w-5" />, color: 'purple' }
}

export default function BoosterDashboard() {
  const { user } = useAuth()
  const [availableOrders, setAvailableOrders] = useState<BoostOrder[]>([])
  const [myOrders, setMyOrders] = useState<BoostOrder[]>([])
  const [activeTab, setActiveTab] = useState<'available' | 'my_orders'>('available')
  const [selectedGame, setSelectedGame] = useState<GameCategory | 'all'>('all')

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [user])

  const loadOrders = () => {
    if (!user) return
    
    const allOrders: BoostOrder[] = JSON.parse(localStorage.getItem('boostOrders') || '[]')
    
    const pending = allOrders.filter(order => 
      order.status === 'pending' && 
      user.gameCategories?.includes(order.service.game)
    )
    setAvailableOrders(pending)

    const mine = allOrders.filter(order => order.boosterId === user.id)
    setMyOrders(mine)
  }

  const claimOrder = (orderId: string) => {
    if (!user) return

    const allOrders: BoostOrder[] = JSON.parse(localStorage.getItem('boostOrders') || '[]')
    const orderIndex = allOrders.findIndex(o => o.id === orderId)
    
    if (orderIndex === -1) return
    
    if (allOrders[orderIndex].status !== 'pending') {
      alert('This order has already been claimed by another booster!')
      loadOrders()
      return
    }

    allOrders[orderIndex] = {
      ...allOrders[orderIndex],
      boosterId: user.id,
      boosterName: user.name,
      status: 'claimed',
      claimedAt: new Date().toISOString()
    }

    localStorage.setItem('boostOrders', JSON.stringify(allOrders))
    loadOrders()
  }

  const updateOrderStatus = (orderId: string, newStatus: BoostOrder['status']) => {
    const allOrders: BoostOrder[] = JSON.parse(localStorage.getItem('boostOrders') || '[]')
    const orderIndex = allOrders.findIndex(o => o.id === orderId)
    
    if (orderIndex === -1) return

    allOrders[orderIndex] = {
      ...allOrders[orderIndex],
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
    }

    localStorage.setItem('boostOrders', JSON.stringify(allOrders))
    loadOrders()
  }

  const filteredAvailableOrders = selectedGame === 'all' 
    ? availableOrders 
    : availableOrders.filter(o => o.service.game === selectedGame)

  const completedOrders = myOrders.filter(o => o.status === 'completed')
  const activeOrders = myOrders.filter(o => o.status === 'claimed' || o.status === 'in_progress')
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.totalPrice * 0.7, 0)

  const getStatusBadge = (status: BoostOrder['status']) => {
    const styles: Record<BoostOrder['status'], { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="h-4 w-4" /> },
      claimed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle className="h-4 w-4" /> },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Play className="h-4 w-4" /> },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: <Trophy className="h-4 w-4" /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle className="h-4 w-4" /> }
    }
    const style = styles[status]
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booster Dashboard</h1>
          <p className="text-gray-600">Claim and complete boost orders</p>
        </div>
        <div className="flex items-center space-x-2 text-purple-600">
          <Gamepad2 className="h-6 w-6" />
          <span className="font-medium">
            {user?.gameCategories?.map(g => GAME_LABELS[g].name).join(', ')}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{availableOrders.length}</p>
            </div>
            <Bell className="h-10 w-10 text-yellow-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="text-2xl font-bold text-purple-600">{activeOrders.length}</p>
            </div>
            <Play className="h-10 w-10 text-purple-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
            </div>
            <Trophy className="h-10 w-10 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-primary-600">${totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'available'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Available Orders ({availableOrders.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('my_orders')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'my_orders'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Gamepad2 className="h-5 w-5" />
                <span>My Orders ({myOrders.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Available Orders Tab */}
        {activeTab === 'available' && (
          <div className="p-6">
            {/* Game Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGame('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedGame === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Games
              </button>
              {user?.gameCategories?.map(game => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    selectedGame === game
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {GAME_LABELS[game].icon}
                  <span>{GAME_LABELS[game].name}</span>
                </button>
              ))}
            </div>

            {filteredAvailableOrders.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No available orders</p>
                <p className="text-gray-400 mt-2">New orders will appear here when buyers purchase services</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAvailableOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={order.service.imageUrl}
                          alt={order.service.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${GAME_LABELS[order.service.game].color}-100 text-${GAME_LABELS[order.service.game].color}-700`}>
                              {GAME_LABELS[order.service.game].icon}
                              <span>{GAME_LABELS[order.service.game].name}</span>
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{order.service.title}</h3>
                          <p className="text-sm text-gray-500">Buyer: {order.buyerName}</p>
                          <div className="mt-2 text-sm text-gray-600">
                            {Object.entries(order.orderDetails).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                <span className="font-medium">{key}:</span> {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">${(order.totalPrice * 0.7).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">You earn (70%)</p>
                        <button
                          onClick={() => claimOrder(order.id)}
                          className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Claim Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'my_orders' && (
          <div className="p-6">
            {myOrders.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders yet</p>
                <p className="text-gray-400 mt-2">Claim orders from the Available tab to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={order.service.imageUrl}
                          alt={order.service.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusBadge(order.status)}
                          </div>
                          <h3 className="font-semibold text-gray-900">{order.service.title}</h3>
                          <p className="text-sm text-gray-500">Buyer: {order.buyerName} ({order.buyerEmail})</p>
                          <div className="mt-2 text-sm text-gray-600">
                            {Object.entries(order.orderDetails).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                <span className="font-medium">{key}:</span> {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">${(order.totalPrice * 0.7).toFixed(2)}</p>
                        {order.status === 'claimed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'in_progress')}
                            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                          >
                            Start Boost
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
