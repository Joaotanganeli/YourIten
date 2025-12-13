'use client'

import { useState, useEffect } from 'react'
import { FixedService, BoostOrder, GameCategory, ServiceType } from '@/types'
import { 
  Plus, Edit2, Trash2, X, Save, Settings, Package, 
  DollarSign, Users, TrendingUp, Swords, Crosshair, Target,
  ShoppingCart, CheckCircle, Clock
} from 'lucide-react'

const GAME_OPTIONS: { id: GameCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'league_of_legends', name: 'League of Legends', icon: <Swords className="h-5 w-5" /> },
  { id: 'valorant', name: 'Valorant', icon: <Crosshair className="h-5 w-5" /> },
  { id: 'deadlock', name: 'Deadlock', icon: <Target className="h-5 w-5" /> }
]

const SERVICE_TYPES: { id: ServiceType; name: string }[] = [
  { id: 'rank_boost', name: 'Rank Boosting' },
  { id: 'account', name: 'Account' },
  { id: 'gold', name: 'Gold/Currency' }
]

export default function AdminDashboard() {
  const [services, setServices] = useState<FixedService[]>([])
  const [boostOrders, setBoostOrders] = useState<BoostOrder[]>([])
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'stats'>('services')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<FixedService | null>(null)
  const [formData, setFormData] = useState({
    game: 'league_of_legends' as GameCategory,
    serviceType: 'rank_boost' as ServiceType,
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    details: {} as Record<string, string>,
    isActive: true
  })
  const [detailKey, setDetailKey] = useState('')
  const [detailValue, setDetailValue] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allServices = JSON.parse(localStorage.getItem('fixedServices') || '[]')
    setServices(allServices)
    
    const allOrders = JSON.parse(localStorage.getItem('boostOrders') || '[]')
    setBoostOrders(allOrders)
  }

  const openAddModal = () => {
    setEditingService(null)
    setFormData({
      game: 'league_of_legends',
      serviceType: 'rank_boost',
      title: '',
      description: '',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
      details: {},
      isActive: true
    })
    setShowModal(true)
  }

  const openEditModal = (service: FixedService) => {
    setEditingService(service)
    setFormData({
      game: service.game,
      serviceType: service.serviceType,
      title: service.title,
      description: service.description,
      price: service.price,
      imageUrl: service.imageUrl,
      details: { ...service.details },
      isActive: service.isActive
    })
    setShowModal(true)
  }

  const addDetail = () => {
    if (detailKey && detailValue) {
      setFormData(prev => ({
        ...prev,
        details: { ...prev.details, [detailKey]: detailValue }
      }))
      setDetailKey('')
      setDetailValue('')
    }
  }

  const removeDetail = (key: string) => {
    setFormData(prev => {
      const newDetails = { ...prev.details }
      delete newDetails[key]
      return { ...prev, details: newDetails }
    })
  }

  const handleSave = () => {
    const allServices = JSON.parse(localStorage.getItem('fixedServices') || '[]')
    
    if (editingService) {
      const index = allServices.findIndex((s: FixedService) => s.id === editingService.id)
      if (index !== -1) {
        allServices[index] = {
          ...editingService,
          ...formData
        }
      }
    } else {
      const newService: FixedService = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString()
      }
      allServices.push(newService)
    }
    
    localStorage.setItem('fixedServices', JSON.stringify(allServices))
    loadData()
    setShowModal(false)
  }

  const deleteService = (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    const allServices = JSON.parse(localStorage.getItem('fixedServices') || '[]')
    const filtered = allServices.filter((s: FixedService) => s.id !== id)
    localStorage.setItem('fixedServices', JSON.stringify(filtered))
    loadData()
  }

  const toggleServiceActive = (id: string) => {
    const allServices = JSON.parse(localStorage.getItem('fixedServices') || '[]')
    const index = allServices.findIndex((s: FixedService) => s.id === id)
    if (index !== -1) {
      allServices[index].isActive = !allServices[index].isActive
      localStorage.setItem('fixedServices', JSON.stringify(allServices))
      loadData()
    }
  }

  const totalRevenue = boostOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPrice, 0)
  
  const pendingOrders = boostOrders.filter(o => o.status === 'pending').length
  const completedOrders = boostOrders.filter(o => o.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage services and monitor orders</p>
        </div>
        <div className="flex items-center space-x-2 text-red-600">
          <Settings className="h-6 w-6" />
          <span className="font-medium">Master Admin</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Services</p>
              <p className="text-2xl font-bold text-primary-600">{services.length}</p>
            </div>
            <Package className="h-10 w-10 text-primary-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Orders</p>
              <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'services'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Services</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Orders ({boostOrders.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Fixed Services</h2>
              <button
                onClick={openAddModal}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Service</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Game</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={service.imageUrl}
                            alt={service.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{service.title}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{service.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize">{service.game.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize">{service.serviceType.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">${service.price}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleServiceActive(service.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEditModal(service)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="text-red-600 hover:text-red-800 p-1 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-6">
            {boostOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {boostOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{order.service.title}</h3>
                        <p className="text-sm text-gray-500">Buyer: {order.buyerName} ({order.buyerEmail})</p>
                        <p className="text-sm text-gray-500">
                          Booster: {order.boosterName || 'Not claimed'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.totalPrice}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'claimed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
                  <select
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value as GameCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {GAME_OPTIONS.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {SERVICE_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Service title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  rows={3}
                  placeholder="Service description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={detailKey}
                    onChange={(e) => setDetailKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Key (e.g., fromRank)"
                  />
                  <input
                    type="text"
                    value={detailValue}
                    onChange={(e) => setDetailValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Value (e.g., Iron)"
                  />
                  <button
                    type="button"
                    onClick={addDetail}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formData.details).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-lg text-sm">
                      <span className="font-medium">{key}:</span> {value}
                      <button
                        type="button"
                        onClick={() => removeDetail(key)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible to buyers)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
