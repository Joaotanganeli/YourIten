'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { GameCategory, ServiceType, BoostConfig, EloRank, FlashPosition, FixedService } from '@/types'
import { 
  ArrowLeft, ArrowRight, Swords, Crosshair, Target, Gamepad2, Trophy, Zap,
  CheckCircle, Users, TrendingUp, Star, Shield, Crown
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface GameInfo {
  id: GameCategory
  name: string
  icon: React.ReactNode
  image: string
  services: ServiceType[]
  ranks?: { id: EloRank; name: string; divisions?: number }[]
}

const GAMES: GameInfo[] = [
  {
    id: 'league_of_legends',
    name: 'League of Legends',
    icon: <Swords className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    services: ['elo_boost', 'duo_boost', 'placement', 'account_level', 'mastery', 'coaching'],
    ranks: [
      { id: 'iron', name: 'Iron', divisions: 4 },
      { id: 'bronze', name: 'Bronze', divisions: 4 },
      { id: 'silver', name: 'Silver', divisions: 4 },
      { id: 'gold', name: 'Gold', divisions: 4 },
      { id: 'platinum', name: 'Platinum', divisions: 4 },
      { id: 'emerald', name: 'Emerald', divisions: 4 },
      { id: 'diamond', name: 'Diamond', divisions: 4 },
      { id: 'master', name: 'Master', divisions: 1 },
      { id: 'grandmaster', name: 'Grandmaster', divisions: 1 },
      { id: 'challenger', name: 'Challenger', divisions: 1 },
    ]
  },
  {
    id: 'valorant',
    name: 'Valorant',
    icon: <Crosshair className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
    services: ['elo_boost', 'duo_boost', 'placement', 'coaching'],
    ranks: [
      { id: 'iron', name: 'Iron', divisions: 3 },
      { id: 'bronze', name: 'Bronze', divisions: 3 },
      { id: 'silver', name: 'Silver', divisions: 3 },
      { id: 'gold', name: 'Gold', divisions: 3 },
      { id: 'platinum', name: 'Platinum', divisions: 3 },
      { id: 'diamond', name: 'Diamond', divisions: 3 },
      { id: 'ascendant', name: 'Ascendant', divisions: 3 },
      { id: 'immortal', name: 'Immortal', divisions: 3 },
      { id: 'radiant', name: 'Radiant', divisions: 1 },
    ]
  },
  {
    id: 'deadlock',
    name: 'Deadlock',
    icon: <Target className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=400',
    services: ['elo_boost', 'duo_boost', 'coaching'],
    ranks: [
      { id: 'bronze', name: 'Initiate', divisions: 6 },
      { id: 'silver', name: 'Seeker', divisions: 6 },
      { id: 'gold', name: 'Alchemist', divisions: 6 },
      { id: 'platinum', name: 'Arcanist', divisions: 6 },
      { id: 'diamond', name: 'Ritualist', divisions: 6 },
      { id: 'master', name: 'Emissary', divisions: 6 },
    ]
  },
  {
    id: 'dota2',
    name: 'Dota 2',
    icon: <Gamepad2 className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    services: ['elo_boost', 'duo_boost', 'coaching', 'account'],
    ranks: [
      { id: 'herald', name: 'Herald', divisions: 5 },
      { id: 'guardian', name: 'Guardian', divisions: 5 },
      { id: 'crusader', name: 'Crusader', divisions: 5 },
      { id: 'archon', name: 'Archon', divisions: 5 },
      { id: 'legend', name: 'Legend', divisions: 5 },
      { id: 'ancient', name: 'Ancient', divisions: 5 },
      { id: 'divine', name: 'Divine', divisions: 5 },
    ]
  },
  {
    id: 'clash_royale',
    name: 'Clash Royale',
    icon: <Trophy className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400',
    services: ['elo_boost', 'account', 'currency'],
  },
  {
    id: 'arc_raiders',
    name: 'Arc Raiders',
    icon: <Zap className="h-8 w-8" />,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    services: ['coaching', 'currency', 'account'],
  },
]

const SERVICE_INFO: Record<ServiceType, { name: string; description: string; icon: React.ReactNode; basePrice: number }> = {
  elo_boost: { name: 'Elo Boost', description: 'Solo queue rank boosting by our pro players', icon: <TrendingUp className="h-6 w-6" />, basePrice: 10 },
  duo_boost: { name: 'Duo Boost', description: 'Play alongside a pro booster in duo queue', icon: <Users className="h-6 w-6" />, basePrice: 15 },
  placement: { name: 'Placement Matches', description: 'Get your placement matches done by pros', icon: <Shield className="h-6 w-6" />, basePrice: 25 },
  account_level: { name: 'Account Leveling', description: 'Level up your account quickly', icon: <Star className="h-6 w-6" />, basePrice: 5 },
  mastery: { name: 'Champion Mastery', description: 'Get mastery points on your favorite champion', icon: <Crown className="h-6 w-6" />, basePrice: 8 },
  account: { name: 'Accounts', description: 'Pre-leveled accounts ready to play', icon: <Gamepad2 className="h-6 w-6" />, basePrice: 20 },
  currency: { name: 'In-Game Currency', description: 'Gold, gems, and other currencies', icon: <Trophy className="h-6 w-6" />, basePrice: 5 },
  coaching: { name: 'Coaching', description: '1-on-1 coaching sessions with pros', icon: <Users className="h-6 w-6" />, basePrice: 30 },
}

const LOL_CHAMPIONS = ['Ahri', 'Akali', 'Ashe', 'Caitlyn', 'Darius', 'Ezreal', 'Garen', 'Irelia', 'Jax', 'Jinx', 'Kaisa', 'Katarina', 'Lee Sin', 'Lux', 'Miss Fortune', 'Riven', 'Thresh', 'Vayne', 'Yasuo', 'Zed']
const LOL_ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support', 'Fill']

type Step = 'games' | 'services' | 'configure' | 'checkout'

export default function ServicesPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('games')
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [boostConfig, setBoostConfig] = useState<BoostConfig>({})
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [availableServices, setAvailableServices] = useState<FixedService[]>([])

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const services = await apiClient.services.list({ activeOnly: true })
      setAvailableServices(services)
    } catch (error) {
      console.error('Failed to load services:', error)
    }
  }

  const calculatePrice = (): number => {
    if (!selectedGame || !selectedService) return 0
    const basePrice = SERVICE_INFO[selectedService].basePrice
    let multiplier = 1
    if (selectedService === 'elo_boost' || selectedService === 'duo_boost') {
      const ranks = selectedGame.ranks || []
      const currentIdx = ranks.findIndex(r => r.id === boostConfig.currentRank)
      const desiredIdx = ranks.findIndex(r => r.id === boostConfig.desiredRank)
      if (currentIdx >= 0 && desiredIdx > currentIdx) {
        multiplier = (desiredIdx - currentIdx) * 2
      }
      if (selectedService === 'duo_boost') multiplier *= 1.5
      if (boostConfig.priorityOrder) multiplier *= 1.3
      if (boostConfig.streamingEnabled) multiplier *= 1.2
    }
    return Math.round(basePrice * multiplier * 100) / 100
  }

  const handleGameSelect = (game: GameInfo) => {
    setSelectedGame(game)
    setSelectedService(null)
    setBoostConfig({})
    setStep('services')
  }

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service)
    if (selectedGame?.ranks && selectedGame.ranks.length > 0) {
      setBoostConfig({
        currentRank: selectedGame.ranks[0].id,
        currentDivision: 4,
        desiredRank: selectedGame.ranks[1]?.id || selectedGame.ranks[0].id,
        desiredDivision: 1,
        flashPosition: 'D',
      })
    }
    setStep('configure')
  }

  const handlePurchase = async () => {
    if (!user || !selectedGame || !selectedService) {
      alert('Please login to purchase')
      return
    }
    if (user.role !== 'buyer') {
      alert('Only buyers can purchase services')
      return
    }

    try {
      const matchingService = availableServices.find(
        s => s.game === selectedGame.id && s.serviceType === selectedService
      )

      if (!matchingService) {
        alert('Service not available. Please contact support.')
        return
      }

      const totalPrice = calculatePrice()
      
      await apiClient.boostOrders.create(matchingService.id, boostConfig, totalPrice)
      setPurchaseSuccess(true)
      setStep('checkout')
    } catch (error) {
      console.error('Failed to create boost order:', error)
      alert('Failed to create order. Please try again.')
    }
  }

  const resetFlow = () => {
    setStep('games')
    setSelectedGame(null)
    setSelectedService(null)
    setBoostConfig({})
    setPurchaseSuccess(false)
  }

  const goBack = () => {
    if (step === 'services') setStep('games')
    else if (step === 'configure') setStep('services')
    else if (step === 'checkout' && !purchaseSuccess) setStep('configure')
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {step !== 'games' && !purchaseSuccess && (
              <button onClick={goBack} className="p-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors">
                <ArrowLeft className="h-5 w-5 text-primary-400" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">Boosting Services</h1>
              <p className="text-dark-400 mt-1">
                {step === 'games' && 'Select a game to get started'}
                {step === 'services' && `Choose a service for ${selectedGame?.name}`}
                {step === 'configure' && 'Configure your boost'}
                {step === 'checkout' && (purchaseSuccess ? 'Order Complete!' : 'Review your order')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {['games', 'services', 'configure', 'checkout'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-primary-500 text-dark-900' :
                  ['games', 'services', 'configure', 'checkout'].indexOf(step) > i ? 'bg-primary-500/30 text-primary-400' :
                  'bg-dark-700 text-dark-400'
                }`}>{i + 1}</div>
                {i < 3 && <div className={`w-12 h-0.5 ${
                  ['games', 'services', 'configure', 'checkout'].indexOf(step) > i ? 'bg-primary-500/50' : 'bg-dark-700'
                }`} />}
              </div>
            ))}
          </div>
        </div>

        {step === 'games' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map(game => (
              <button key={game.id} onClick={() => handleGameSelect(game)} className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all group text-left">
                <div className="relative h-40 overflow-hidden">
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-primary-400">{game.icon}</div>
                    <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {game.services.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-dark-700 text-dark-300 px-2 py-1 rounded">{SERVICE_INFO[s].name}</span>
                    ))}
                    {game.services.length > 3 && (
                      <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">+{game.services.length - 3} more</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'services' && selectedGame && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedGame.services.map(serviceType => {
              const info = SERVICE_INFO[serviceType]
              return (
                <button key={serviceType} onClick={() => handleServiceSelect(serviceType)} className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all text-left group">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 text-primary-400 group-hover:bg-primary-500/20 transition-colors">{info.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{info.name}</h3>
                  <p className="text-dark-400 text-sm mb-4">{info.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-400 font-bold">From ${info.basePrice}</span>
                    <ArrowRight className="h-5 w-5 text-dark-500 group-hover:text-primary-400 transition-colors" />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {step === 'configure' && selectedGame && selectedService && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {(selectedService === 'elo_boost' || selectedService === 'duo_boost') && selectedGame.ranks && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                  <h3 className="text-lg font-bold text-white mb-4">Rank Selection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Current Rank</label>
                      <select value={boostConfig.currentRank || ''} onChange={(e) => setBoostConfig({ ...boostConfig, currentRank: e.target.value as EloRank })} className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none">
                        {selectedGame.ranks.map(rank => (<option key={rank.id} value={rank.id}>{rank.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Desired Rank</label>
                      <select value={boostConfig.desiredRank || ''} onChange={(e) => setBoostConfig({ ...boostConfig, desiredRank: e.target.value as EloRank })} className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none">
                        {selectedGame.ranks.map(rank => (<option key={rank.id} value={rank.id}>{rank.name}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedGame.id === 'league_of_legends' && (selectedService === 'elo_boost' || selectedService === 'duo_boost') && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                  <h3 className="text-lg font-bold text-white mb-4">Game Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Flash Key Position</label>
                      <div className="flex space-x-4">
                        {(['D', 'F'] as FlashPosition[]).map(pos => (
                          <button key={pos} onClick={() => setBoostConfig({ ...boostConfig, flashPosition: pos })} className={`flex-1 py-3 rounded-lg font-bold text-lg transition-colors ${boostConfig.flashPosition === pos ? 'bg-primary-500 text-dark-900' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>{pos}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Preferred Role</label>
                      <select value={boostConfig.specificRole || ''} onChange={(e) => setBoostConfig({ ...boostConfig, specificRole: e.target.value })} className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none">
                        <option value="">Any Role</option>
                        {LOL_ROLES.map(role => (<option key={role} value={role}>{role}</option>))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Preferred Champion</label>
                    <select value={boostConfig.champion || ''} onChange={(e) => setBoostConfig({ ...boostConfig, champion: e.target.value })} className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">Any Champion</option>
                      {LOL_CHAMPIONS.map(champ => (<option key={champ} value={champ}>{champ}</option>))}
                    </select>
                  </div>
                </div>
              )}

              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h3 className="text-lg font-bold text-white mb-4">Extra Options</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                    <div><span className="text-white font-medium">Priority Order</span><p className="text-dark-400 text-sm">Your order will be completed faster (+30%)</p></div>
                    <input type="checkbox" checked={boostConfig.priorityOrder || false} onChange={(e) => setBoostConfig({ ...boostConfig, priorityOrder: e.target.checked })} className="w-5 h-5 accent-primary-500" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                    <div><span className="text-white font-medium">Stream Games</span><p className="text-dark-400 text-sm">Watch your booster play live (+20%)</p></div>
                    <input type="checkbox" checked={boostConfig.streamingEnabled || false} onChange={(e) => setBoostConfig({ ...boostConfig, streamingEnabled: e.target.checked })} className="w-5 h-5 accent-primary-500" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                    <div><span className="text-white font-medium">Offline Mode</span><p className="text-dark-400 text-sm">Appear offline while boosting</p></div>
                    <input type="checkbox" checked={boostConfig.offlineMode || false} onChange={(e) => setBoostConfig({ ...boostConfig, offlineMode: e.target.checked })} className="w-5 h-5 accent-primary-500" />
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-dark-300"><span>Game</span><span className="text-white">{selectedGame.name}</span></div>
                  <div className="flex justify-between text-dark-300"><span>Service</span><span className="text-white">{SERVICE_INFO[selectedService].name}</span></div>
                  {boostConfig.currentRank && (<div className="flex justify-between text-dark-300"><span>From</span><span className="text-white capitalize">{boostConfig.currentRank.replace('_', ' ')}</span></div>)}
                  {boostConfig.desiredRank && (<div className="flex justify-between text-dark-300"><span>To</span><span className="text-primary-400 capitalize">{boostConfig.desiredRank.replace('_', ' ')}</span></div>)}
                </div>
                <div className="border-t border-dark-600 pt-4 mb-6">
                  <div className="flex justify-between items-center"><span className="text-dark-300">Total</span><span className="text-3xl font-bold text-primary-400">${calculatePrice()}</span></div>
                </div>
                <button onClick={handlePurchase} className="w-full bg-primary-500 text-dark-900 py-4 rounded-lg font-bold hover:bg-primary-400 transition-colors glow-green">Purchase Now</button>
              </div>
            </div>
          </div>
        )}

        {step === 'checkout' && purchaseSuccess && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
              <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-primary-400" /></div>
              <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
              <p className="text-dark-400 mb-6">Your boost order has been placed successfully. A booster will claim it shortly.</p>
              <div className="bg-dark-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-2"><span className="text-dark-400">Order Total</span><span className="text-primary-400 font-bold">${calculatePrice()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-dark-400">Status</span><span className="text-yellow-400">Pending</span></div>
              </div>
              <button onClick={resetFlow} className="w-full bg-primary-500 text-dark-900 py-3 rounded-lg font-bold hover:bg-primary-400 transition-colors">Order Another Boost</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
