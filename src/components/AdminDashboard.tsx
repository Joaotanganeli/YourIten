'use client'

import { useState, useEffect } from 'react'
import { FixedService, BoostOrder, GameCategory, ServiceType } from '@/types'
import { 
  Plus, Edit2, Trash2, X, Save, Settings, Package, 
  DollarSign, Users, TrendingUp, Swords, Crosshair, Target,
  ShoppingCart, CheckCircle, Clock
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

const GAME_OPTIONS: { id: GameCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'league_of_legends', name: 'League of Legends', icon: <Swords className="h-5 w-5" /> },
  { id: 'valorant', name: 'Valorant', icon: <Crosshair className="h-5 w-5" /> },
  { id: 'deadlock', name: 'Deadlock', icon: <Target className="h-5 w-5" /> },
  { id: 'dota2', name: 'Dota 2', icon: <Target className="h-5 w-5" /> },
  { id: 'clash_royale', name: 'Clash Royale', icon: <Target className="h-5 w-5" /> },
  { id: 'arc_raiders', name: 'Arc Raiders', icon: <Target className="h-5 w-5" /> }
]

const SERVICE_TYPES: { id: ServiceType; name: string }[] = [
  { id: 'elo_boost', name: 'Elo Boost' },
  { id: 'duo_boost', name: 'Duo Boost' },
  { id: 'placement', name: 'Placement Matches' },
  { id: 'account_level', name: 'Account Level' },
  { id: 'mastery', name: 'Mastery' },
  { id: 'coaching', name: 'Coaching' },
  { id: 'account', name: 'Account' },
  { id: 'currency', name: 'Currency' }
]

export default function AdminDashboard() {
  const [services, setServices] = useState<FixedService[]>([])
  const [boostOrders, setBoostOrders] = useState<BoostOrder[]>([])
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'stats'>('services')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<FixedService | null>(null)
  const [formData, setFormData] = useState({
    game: 'league_of_legends' as GameCategory,
    serviceType: 'elo_boost' as ServiceType,
    title: '',
    description: '',
    basePrice: 0,
    pricePerDivision: 0,
    imageUrl: '',
    availableOptions: [] as string[],
    isActive: true
  })
  const [detailKey, setDetailKey] = useState('')
  const [detailValue, setDetailValue] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [servicesData, ordersData] = await Promise.all([
        apiClient.services.list(),
        apiClient.boostOrders.list({})
      ])
      setServices(servicesData)
      setBoostOrders(ordersData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const openAddModal = () => {
    setEditingService(null)
    setFormData({
      game: 'league_of_legends',
      serviceType: 'elo_boost',
      title: '',
      description: '',
      basePrice: 0,
      pricePerDivision: 0,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
      availableOptions: [],
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
      basePrice: service.basePrice,
      pricePerDivision: service.pricePerDivision || 0,
      imageUrl: service.imageUrl,
      availableOptions: service.availableOptions || [],
      isActive: service.isActive
    })
    setShowModal(true)
  }

  const addOption = () => {
    if (detailValue) {
      setFormData(prev => ({
        ...prev,
        availableOptions: [...prev.availableOptions, detailValue]
      }))
      setDetailValue('')
    }
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availableOptions: prev.availableOptions.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    try {
      const serviceData = {
        game: formData.game,
        serviceType: formData.serviceType,
        title: formData.title,
        description: formData.description,
        basePrice: formData.basePrice,
        pricePerDivision: formData.pricePerDivision,
        imageUrl: formData.imageUrl,
        availableOptions: formData.availableOptions,
        isActive: formData.isActive
      }

      if (editingService) {
        await apiClient.services.update(editingService.id, serviceData)
      } else {
        await apiClient.services.create(serviceData)
      }
      
      await loadData()
      setShowModal(false)
    } catch (error) {
      console.error('Failed to save service:', error)
      alert('Failed to save service. Please try again.')
    }
  }

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      await apiClient.services.delete(id)
      await loadData()
    } catch (error) {
      console.error('Failed to delete service:', error)
      alert('Failed to delete service. Please try again.')
    }
  }

  const toggleServiceActive = async (id: string) => {
    const service = services.find(s => s.id === id)
    if (!service) return

    try {
      await apiClient.services.toggleActive(id, !service.isActive)
      await loadData()
    } catch (error) {
      console.error('Failed to toggle service:', error)
      alert('Failed to toggle service status. Please try again.')
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
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-dark-400">Manage services and monitor orders</p>
        </div>
        <div className="flex items-center space-x-2 text-red-400">
          <Settings className="h-6 w-6" />
          <span className="font-medium">Master Admin</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Total Services</p>
              <p className="text-2xl font-bold text-primary-400">{services.length}</p>
            </div>
            <Package className="h-10 w-10 text-primary-500/20" />
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingOrders}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500/20" />
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Completed Orders</p>
              <p className="text-2xl font-bold text-green-400">{completedOrders}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500/20" />
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500/20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="border-b border-dark-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'services'
                  ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/10'
                  : 'text-dark-400 hover:text-dark-300'
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
                  ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/10'
                  : 'text-dark-400 hover:text-dark-300'
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
                className="bg-primary-500 text-dark-900 px-4 py-2 rounded-lg font-bold hover:bg-primary-400 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 px-4 font-medium text-dark-400">Service</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-400">Game</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-400">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-dark-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={service.imageUrl}
                            alt={service.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-white">{service.title}</p>
                            <p className="text-xs text-dark-400 truncate max-w-xs">{service.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-dark-300">
                        <span className="capitalize">{service.game.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4 text-dark-300">
                        <span className="capitalize">{service.serviceType.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-primary-400">${service.basePrice}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleServiceActive(service.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            service.isActive
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEditModal(service)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="text-red-400 hover:text-red-300 p-1 ml-2"
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
                <ShoppingCart className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 text-lg">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {boostOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                  <div key={order.id} className="border border-dark-700 rounded-lg p-4 bg-dark-800/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">{order.service.title}</h3>
                        <p className="text-sm text-dark-400">Buyer: {order.buyerName} ({order.buyerEmail})</p>
                        <p className="text-sm text-dark-400">
                          Booster: {order.boosterName || 'Not claimed'}
                        </p>
                        <p className="text-xs text-dark-500 mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary-400">${order.totalPrice}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          order.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                          order.status === 'claimed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-dark-700">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Game</label>
                  <select
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value as GameCategory })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-white"
                  >
                    {GAME_OPTIONS.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-white"
                  >
                    {SERVICE_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-white"
                  placeholder="Service title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-white"
                  rows={3}
                  placeholder="Service description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Price Per Division ($)</label>
                  <input
                    type="number"
                    value={formData.pricePerDivision}
                    onChange={(e) => setFormData({ ...formData, pricePerDivision: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Available Options</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={detailValue}
                    onChange={(e) => setDetailValue(e.target.value)}
                    className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-white"
                    placeholder="Option (e.g., Solo Queue, Duo Queue)"
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg hover:bg-dark-600 text-white"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.availableOptions.map((option, index) => (
                    <span key={index} className="inline-flex items-center bg-dark-700 border border-dark-600 px-2 py-1 rounded-lg text-sm text-white">
                      {option}
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="ml-1 text-red-400 hover:text-red-300"
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
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-dark-300">
                  Active (visible to buyers)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-dark-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-dark-600 rounded-lg hover:bg-dark-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-500 text-dark-900 rounded-lg hover:bg-primary-400 font-bold"
              >
                {editingService ? 'Update' : 'Create'} Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
