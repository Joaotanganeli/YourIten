'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FixedService, BoostOrder, GameCategory, ServiceType } from '@/types'
import { 
  Search, Filter, ShoppingCart, X, Swords, Crosshair, Target,
  Trophy, User as UserIcon, Coins, CheckCircle
} from 'lucide-react'

const GAME_OPTIONS: { id: GameCategory | 'all'; name: string; icon: React.ReactNode }[] = [
  { id: 'all', name: 'All Games', icon: <Filter className="h-5 w-5" /> },
  { id: 'league_of_legends', name: 'League of Legends', icon: <Swords className="h-5 w-5" /> },
  { id: 'valorant', name: 'Valorant', icon: <Crosshair className="h-5 w-5" /> },
  { id: 'deadlock', name: 'Deadlock', icon: <Target className="h-5 w-5" /> }
]

const SERVICE_TYPE_ICONS: Record<ServiceType, React.ReactNode> = {
  rank_boost: <Trophy className="h-5 w-5" />,
  account: <UserIcon className="h-5 w-5" />,
  gold: <Coins className="h-5 w-5" />
}

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<FixedService[]>([])
  const [filteredServices, setFilteredServices] = useState<FixedService[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGame, setSelectedGame] = useState<GameCategory | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ServiceType | 'all'>('all')
  const [selectedService, setSelectedService] = useState<FixedService | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [orderDetails, setOrderDetails] = useState<Record<string, string>>({})

  useEffect(() => {
    const allServices: FixedService[] = JSON.parse(localStorage.getItem('fixedServices') || '[]')
    const activeServices = allServices.filter(s => s.isActive)
    setServices(activeServices)
    setFilteredServices(activeServices)
  }, [])

  useEffect(() => {
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedGame !== 'all') {
      filtered = filtered.filter(s => s.game === selectedGame)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(s => s.serviceType === selectedType)
    }

    setFilteredServices(filtered)
  }, [searchTerm, selectedGame, selectedType, services])

  const handleBuyClick = (service: FixedService) => {
    if (!user) {
      alert('Please login to purchase services')
      return
    }
    if (user.role !== 'buyer') {
      alert('Only buyers can purchase services')
      return
    }
    setSelectedService(service)
    setOrderDetails({ ...service.details })
    setShowPurchaseModal(true)
    setPurchaseSuccess(false)
  }

  const handlePurchase = () => {
    if (!user || !selectedService) return

    const newOrder: BoostOrder = {
      id: crypto.randomUUID(),
      serviceId: selectedService.id,
      service: selectedService,
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email,
      status: 'pending',
      orderDetails: orderDetails,
      totalPrice: selectedService.price,
      createdAt: new Date().toISOString()
    }

    const orders = JSON.parse(localStorage.getItem('boostOrders') || '[]')
    orders.push(newOrder)
    localStorage.setItem('boostOrders', JSON.stringify(orders))

    setPurchaseSuccess(true)
  }

  const closeModal = () => {
    setShowPurchaseModal(false)
    setSelectedService(null)
    setOrderDetails({})
    setPurchaseSuccess(false)
  }

  const getGameLabel = (game: GameCategory) => {
    const labels: Record<GameCategory, string> = {
      league_of_legends: 'League of Legends',
      valorant: 'Valorant',
      deadlock: 'Deadlock'
    }
    return labels[game]
  }

  const getGameColor = (game: GameCategory) => {
    const colors: Record<GameCategory, string> = {
      league_of_legends: 'blue',
      valorant: 'red',
      deadlock: 'purple'
    }
    return colors[game]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Boosting Services</h1>
          <p className="text-gray-600 mt-1">Professional gaming services for all your needs</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Game Filter */}
            <div className="flex flex-wrap gap-2">
              {GAME_OPTIONS.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    selectedGame === game.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {game.icon}
                  <span className="hidden sm:inline">{game.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Service Type Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('rank_boost')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                selectedType === 'rank_boost'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Rank Boost</span>
            </button>
            <button
              onClick={() => setSelectedType('account')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                selectedType === 'account'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Accounts</span>
            </button>
            <button
              onClick={() => setSelectedType('gold')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                selectedType === 'gold'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>Gold/Currency</span>
            </button>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No services found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map(service => (
              <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-${getGameColor(service.game)}-100 text-${getGameColor(service.game)}-700 flex items-center space-x-1`}>
                    {service.game === 'league_of_legends' && <Swords className="h-3 w-3" />}
                    {service.game === 'valorant' && <Crosshair className="h-3 w-3" />}
                    {service.game === 'deadlock' && <Target className="h-3 w-3" />}
                    <span>{getGameLabel(service.game)}</span>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 flex items-center space-x-1">
                    {SERVICE_TYPE_ICONS[service.serviceType]}
                    <span className="capitalize">{service.serviceType.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{service.description}</p>
                  
                  {Object.keys(service.details).length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {Object.entries(service.details).slice(0, 2).map(([key, value]) => (
                        <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">${service.price}</span>
                    <button
                      onClick={() => handleBuyClick(service)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-1"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {purchaseSuccess ? 'Order Placed!' : 'Confirm Purchase'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {purchaseSuccess ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for your order!</h3>
                  <p className="text-gray-600 mb-4">
                    Your order has been placed. A booster will claim it shortly and begin working on it.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    You can track your order status in your dashboard.
                  </p>
                  <button
                    onClick={closeModal}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex space-x-4 mb-6">
                    <img
                      src={selectedService.imageUrl}
                      alt={selectedService.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${getGameColor(selectedService.game)}-100 text-${getGameColor(selectedService.game)}-700`}>
                          {getGameLabel(selectedService.game)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{selectedService.title}</h3>
                      <p className="text-sm text-gray-500">{selectedService.description}</p>
                    </div>
                  </div>

                  {Object.keys(selectedService.details).length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order Details</label>
                      <div className="space-y-2">
                        {Object.entries(orderDetails).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 w-24">{key}:</span>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setOrderDetails({ ...orderDetails, [key]: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary-600">${selectedService.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePurchase}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Confirm Purchase
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
