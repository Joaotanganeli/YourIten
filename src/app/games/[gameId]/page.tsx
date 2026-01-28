'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { FixedService, EloRank, FlashPosition, BoostConfig } from '@/types'
import { apiClient } from '@/lib/api-client'
import { ArrowLeft, TrendingUp, Star, Zap, Shield, CheckCircle, User, Search, Coins, Package, ChevronRight, Users, Crown } from 'lucide-react'

interface ServiceWithCategory extends FixedService {
  category?: string
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  stock: number
  imageUrl: string
  category: string
  game: string
  productType: string
  server?: string
  rank?: string
  level?: number
  blueEssence?: number
  championsCount?: number
  skinsCount?: number
  isHandmade?: boolean
  isRankedReady?: boolean
  sellerName: string
  sellerRating: number
  sellerTotalSales: number
  sellerTotalReviews: number
}

interface RankInfo {
  id: EloRank
  name: string
  divisions?: number
}

interface GameRankConfig {
  ranks: RankInfo[]
  servers: string[]
  queueTypes: string[]
}

const GAME_CONFIGS: Record<string, GameRankConfig> = {
  league_of_legends: {
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
    ],
    servers: ['EUW', 'EUNE', 'NA', 'BR', 'LAN', 'LAS', 'OCE', 'RU', 'TR', 'JP', 'KR'],
    queueTypes: ['Solo/Duo', 'Flex']
  },
  valorant: {
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
    ],
    servers: ['EU', 'NA', 'LATAM', 'BR', 'AP', 'KR'],
    queueTypes: ['Competitive']
  },
  deadlock: {
    ranks: [
      { id: 'bronze', name: 'Initiate', divisions: 6 },
      { id: 'silver', name: 'Seeker', divisions: 6 },
      { id: 'gold', name: 'Alchemist', divisions: 6 },
      { id: 'platinum', name: 'Arcanist', divisions: 6 },
      { id: 'diamond', name: 'Ritualist', divisions: 6 },
      { id: 'master', name: 'Emissary', divisions: 6 },
    ],
    servers: ['EU', 'NA', 'ASIA'],
    queueTypes: ['Ranked']
  },
  dota2: {
    ranks: [
      { id: 'herald', name: 'Herald', divisions: 5 },
      { id: 'guardian', name: 'Guardian', divisions: 5 },
      { id: 'crusader', name: 'Crusader', divisions: 5 },
      { id: 'archon', name: 'Archon', divisions: 5 },
      { id: 'legend', name: 'Legend', divisions: 5 },
      { id: 'ancient', name: 'Ancient', divisions: 5 },
      { id: 'divine', name: 'Divine', divisions: 5 },
    ],
    servers: ['EU West', 'EU East', 'US East', 'US West', 'SEA', 'Russia'],
    queueTypes: ['Ranked']
  }
}

const LOL_CHAMPIONS = ['Ahri', 'Akali', 'Ashe', 'Caitlyn', 'Darius', 'Ezreal', 'Garen', 'Irelia', 'Jax', 'Jinx', 'Kaisa', 'Katarina', 'Lee Sin', 'Lux', 'Miss Fortune', 'Riven', 'Thresh', 'Vayne', 'Yasuo', 'Zed']
const LOL_ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support', 'Fill']

type CategoryType = 'accounts' | 'rp' | 'division_boost' | 'placement' | 'win_boost' | 'coaching'

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.gameId as string
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceWithCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('accounts')
  const [searchTerm, setSearchTerm] = useState('')
  const [serverFilter, setServerFilter] = useState('all')
  const [rankFilter, setRankFilter] = useState('all')
  
  // Boost configuration state
  const [boostConfig, setBoostConfig] = useState<BoostConfig>({})
  const [completionMethod, setCompletionMethod] = useState<'solo' | 'duo'>('solo')
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  
  const gameConfig = GAME_CONFIGS[gameId]

  const isBoostingCategory = (cat: CategoryType) => {
    return ['division_boost', 'placement', 'win_boost', 'coaching'].includes(cat)
  }
  
  // Initialize boost config when category changes
  useEffect(() => {
    if (isBoostingCategory(selectedCategory) && gameConfig?.ranks) {
      setBoostConfig({
        currentRank: gameConfig.ranks[0].id,
        currentDivision: gameConfig.ranks[0].divisions || 1,
        desiredRank: gameConfig.ranks[1]?.id || gameConfig.ranks[0].id,
        desiredDivision: 1,
        flashPosition: 'D',
        server: gameConfig.servers[0],
        queueType: gameConfig.queueTypes[0]
      })
      setPurchaseSuccess(false)
    }
  }, [selectedCategory, gameId])

  useEffect(() => {
    loadData()
  }, [gameId, selectedCategory])

  const loadData = async () => {
    setLoading(true)
    try {
      if (isBoostingCategory(selectedCategory)) {
        const response = await fetch(`/api/services?game=${gameId}&activeOnly=true`)
        const data = await response.json()
        // Convert snake_case to camelCase for services
        const convertedServices = data.map((s: any) => ({
          id: s.id,
          game: s.game,
          serviceType: s.service_type,
          title: s.title,
          description: s.description,
          basePrice: typeof s.base_price === 'string' ? parseFloat(s.base_price) : s.base_price,
          pricePerDivision: s.price_per_division,
          imageUrl: s.image_url,
          availableOptions: s.available_options,
          isActive: s.is_active,
          isFeatured: s.is_featured,
          isHotOffer: s.is_hot_offer,
          viewCount: s.view_count,
          orderCount: s.order_count,
          weeklyOrderCount: s.weekly_order_count,
          displayOrder: s.display_order,
          createdAt: s.created_at
        }))
        setServices(convertedServices)
        setProducts([])
      } else {
        const productType = selectedCategory === 'accounts' ? 'account' : selectedCategory
        const response = await fetch(`/api/products?game=${gameId}&productType=${productType}`)
        const data = await response.json()
        const convertedProducts = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
          stock: typeof p.stock === 'string' ? parseInt(p.stock) : p.stock,
          imageUrl: p.image_url,
          category: p.category,
          game: p.game,
          productType: p.product_type,
          server: p.server,
          rank: p.rank,
          level: p.level,
          blueEssence: p.blue_essence,
          championsCount: p.champions_count,
          skinsCount: p.skins_count,
          isHandmade: p.is_handmade,
          isRankedReady: p.is_ranked_ready,
          sellerName: p.seller_name || 'Unknown',
          sellerRating: p.seller_rating ? parseFloat(p.seller_rating) : 5.0,
          sellerTotalSales: p.seller_total_sales || 0,
          sellerTotalReviews: p.seller_total_reviews || 0
        }))
        setProducts(convertedProducts)
        setServices([])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'accounts' as CategoryType, name: 'Accounts', icon: User, isProduct: true },
    { id: 'rp' as CategoryType, name: 'RP', icon: Coins, isProduct: true },
    { id: 'division_boost' as CategoryType, name: 'Division Boost', icon: TrendingUp, isProduct: false },
    { id: 'placement' as CategoryType, name: 'Placement Matches', icon: Zap, isProduct: false },
    { id: 'win_boost' as CategoryType, name: 'Win Boost', icon: Shield, isProduct: false },
    { id: 'coaching' as CategoryType, name: 'Coaching', icon: CheckCircle, isProduct: false },
  ]

  const getGameName = () => {
    const names: Record<string, string> = {
      'league_of_legends': 'League of Legends',
      'valorant': 'Valorant',
      'dota2': 'Dota 2',
      'deadlock': 'Deadlock',
      'clash_royale': 'Clash Royale',
      'arc_raiders': 'Arc Raiders'
    }
    return names[gameId] || gameId
  }

  const getCurrencyName = () => {
    const currencies: Record<string, string> = {
      'league_of_legends': 'RP',
      'valorant': 'VP',
      'clash_royale': 'Gems',
      'dota2': 'Dota Plus'
    }
    return currencies[gameId] || 'Currency'
  }

  const calculatePrice = (): number => {
    if (!gameConfig?.ranks) return 0
    
    const basePrice = selectedCategory === 'division_boost' ? 10 : 
                      selectedCategory === 'placement' ? 25 :
                      selectedCategory === 'win_boost' ? 15 : 30
    
    let multiplier = 1
    
    if (selectedCategory === 'division_boost' || selectedCategory === 'win_boost') {
      const currentIdx = gameConfig.ranks.findIndex(r => r.id === boostConfig.currentRank)
      const desiredIdx = gameConfig.ranks.findIndex(r => r.id === boostConfig.desiredRank)
      
      if (currentIdx >= 0 && desiredIdx > currentIdx) {
        multiplier = (desiredIdx - currentIdx) * 2
      }
      
      if (completionMethod === 'duo') multiplier *= 1.5
    }
    
    if (boostConfig.priorityOrder) multiplier *= 1.3
    if (boostConfig.streamingEnabled) multiplier *= 1.2
    
    return Math.round(basePrice * multiplier * 100) / 100
  }
  
  const handlePurchase = async () => {
    if (!user) {
      alert('Please login to purchase')
      return
    }
    if (user.role !== 'buyer') {
      alert('Only buyers can purchase services')
      return
    }
    
    setPurchasing(true)
    try {
      const serviceTypeMap: Record<CategoryType, string> = {
        'division_boost': 'elo_boost',
        'placement': 'placement',
        'win_boost': 'duo_boost',
        'coaching': 'coaching',
        'accounts': '',
        'rp': ''
      }
      
      const matchingService = services.find(
        s => s.serviceType === serviceTypeMap[selectedCategory]
      )
      
      if (!matchingService) {
        alert('Service not available. Please contact support.')
        return
      }
      
      const totalPrice = calculatePrice()
      await apiClient.boostOrders.create(matchingService.id, boostConfig, totalPrice)
      setPurchaseSuccess(true)
    } catch (error) {
      console.error('Failed to create boost order:', error)
      alert('Failed to create order. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }
  
  const handleServiceClick = (serviceId: string) => {
    router.push(`/services?game=${gameId}&service=${serviceId}`)
  }

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'
            }`}
          />
        ))}
      </div>
    )
  }

  const filteredProducts = products.filter(p => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (serverFilter !== 'all' && p.server !== serverFilter) return false
    if (rankFilter !== 'all' && p.rank !== rankFilter) return false
    return true
  })

  const filteredServices = services.filter(s => {
    const serviceTypeMap: Record<CategoryType, string> = {
      'division_boost': 'elo_boost',
      'placement': 'placement',
      'win_boost': 'duo_boost',
      'coaching': 'coaching',
      'accounts': '',
      'rp': ''
    }
    return s.serviceType === serviceTypeMap[selectedCategory]
  })

  const servers = Array.from(new Set(products.map(p => p.server).filter(Boolean))) as string[]
  const ranks = Array.from(new Set(products.map(p => p.rank).filter(Boolean))) as string[]

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-dark-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-white uppercase tracking-wide">{getGameName()}</h1>
            </div>
            <div className="flex items-center gap-4 text-xs text-dark-400">
              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-green-400" /> Instant delivery</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-blue-400" /> SSL Secure</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-400" /> Handmade 100% Safe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon
                const displayName = cat.id === 'rp' ? getCurrencyName() : cat.name
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                    }`}
                  >
                    <span className="font-medium">{displayName}</span>
                    {selectedCategory === cat.id && <ChevronRight className="h-4 w-4" />}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Filters (for products only) */}
            {!isBoostingCategory(selectedCategory) && (
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Filter dropdowns */}
                {selectedCategory === 'accounts' && (
                  <div className="flex gap-4 mb-4">
                    <select
                      value={serverFilter}
                      onChange={(e) => setServerFilter(e.target.value)}
                      className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    >
                      <option value="all">Server</option>
                      {servers.map(server => (
                        <option key={server} value={server}>{server}</option>
                      ))}
                    </select>
                    <select
                      value={rankFilter}
                      onChange={(e) => setRankFilter(e.target.value)}
                      className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    >
                      <option value="all">Rank</option>
                      {ranks.map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Results count */}
                <div className="text-dark-400 text-sm mb-4">
                  {filteredProducts.length} offers available
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!isBoostingCategory(selectedCategory) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden hover:border-primary-500/50 transition-all cursor-pointer group"
                  >
                    {/* Product Image */}
                    <div className="relative h-48">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      {product.isHandmade && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-green-500/90 text-white text-xs font-medium rounded flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Instant delivery
                        </span>
                      )}
                      <span className="absolute bottom-3 right-3 px-2 py-1 bg-dark-900/80 text-white text-xs rounded">
                        {product.stock} in stock
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {product.server && (
                          <span className="text-primary-400 font-bold text-sm">{product.server}</span>
                        )}
                        {product.rank && (
                          <span className="text-dark-400 text-sm">· {product.rank}</span>
                        )}
                      </div>
                      <p className="text-dark-300 text-sm mb-3 line-clamp-2">{product.description}</p>

                      {/* Product attributes */}
                      {product.productType === 'account' && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.blueEssence && (
                            <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded">
                              BE: {product.blueEssence.toLocaleString()}
                            </span>
                          )}
                          {product.level && (
                            <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded">
                              Lvl {product.level}
                            </span>
                          )}
                          {product.championsCount && (
                            <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded">
                              {product.championsCount} Champs
                            </span>
                          )}
                          {product.isHandmade && (
                            <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded">
                              Handmade
                            </span>
                          )}
                        </div>
                      )}

                      {/* Seller info */}
                      <div className="flex items-center justify-between pt-3 border-t border-dark-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-dark-400" />
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">{product.sellerName}</div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-yellow-400 text-xs">{product.sellerRating.toFixed(1)}</span>
                              <span className="text-dark-400 text-xs">({product.sellerTotalReviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & Buy */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-2xl font-bold text-white">
                          ${product.price.toFixed(2).split('.')[0]}
                          <span className="text-lg text-dark-400">.{product.price.toFixed(2).split('.')[1]}</span>
                        </div>
                        <button className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold rounded-lg transition-colors flex items-center gap-1">
                          Buy now <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Boost Configuration Form (for boosting categories) */}
            {isBoostingCategory(selectedCategory) && gameConfig && !purchaseSuccess && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Options */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Server & Queue Selection */}
                  <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h3 className="text-lg font-bold text-white mb-4">Server & Queue</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Server</label>
                        <select
                          value={boostConfig.server || gameConfig.servers[0]}
                          onChange={(e) => setBoostConfig({ ...boostConfig, server: e.target.value })}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                          {gameConfig.servers.map(server => (
                            <option key={server} value={server}>{server}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Queue Type</label>
                        <select
                          value={boostConfig.queueType || gameConfig.queueTypes[0]}
                          onChange={(e) => setBoostConfig({ ...boostConfig, queueType: e.target.value })}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                          {gameConfig.queueTypes.map(queue => (
                            <option key={queue} value={queue}>{queue}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rank Selection (for division boost and win boost) */}
                  {(selectedCategory === 'division_boost' || selectedCategory === 'win_boost') && (
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                      <h3 className="text-lg font-bold text-white mb-4">Rank Selection</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">Current Rank</label>
                          <select
                            value={boostConfig.currentRank || ''}
                            onChange={(e) => setBoostConfig({ ...boostConfig, currentRank: e.target.value as EloRank })}
                            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          >
                            {gameConfig.ranks.map(rank => (
                              <option key={rank.id} value={rank.id}>{rank.name}</option>
                            ))}
                          </select>
                          {(gameConfig.ranks.find(r => r.id === boostConfig.currentRank)?.divisions || 0) > 1 && (
                            <select
                              value={boostConfig.currentDivision || 4}
                              onChange={(e) => setBoostConfig({ ...boostConfig, currentDivision: parseInt(e.target.value) })}
                              className="w-full mt-2 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                              {Array.from({ length: gameConfig.ranks.find(r => r.id === boostConfig.currentRank)?.divisions || 4 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Division {i + 1}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">Desired Rank</label>
                          <select
                            value={boostConfig.desiredRank || ''}
                            onChange={(e) => setBoostConfig({ ...boostConfig, desiredRank: e.target.value as EloRank })}
                            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          >
                            {gameConfig.ranks.map(rank => (
                              <option key={rank.id} value={rank.id}>{rank.name}</option>
                            ))}
                          </select>
                          {(gameConfig.ranks.find(r => r.id === boostConfig.desiredRank)?.divisions || 0) > 1 && (
                            <select
                              value={boostConfig.desiredDivision || 1}
                              onChange={(e) => setBoostConfig({ ...boostConfig, desiredDivision: parseInt(e.target.value) })}
                              className="w-full mt-2 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                              {Array.from({ length: gameConfig.ranks.find(r => r.id === boostConfig.desiredRank)?.divisions || 4 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Division {i + 1}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Completion Method */}
                  {(selectedCategory === 'division_boost' || selectedCategory === 'win_boost') && (
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                      <h3 className="text-lg font-bold text-white mb-4">Completion Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setCompletionMethod('solo')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            completionMethod === 'solo'
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-dark-600 hover:border-dark-500'
                          }`}
                        >
                          <TrendingUp className={`h-8 w-8 mx-auto mb-2 ${completionMethod === 'solo' ? 'text-primary-400' : 'text-dark-400'}`} />
                          <div className="text-white font-bold">Solo (Piloted)</div>
                          <div className="text-dark-400 text-sm">Pro plays on your account</div>
                        </button>
                        <button
                          onClick={() => setCompletionMethod('duo')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            completionMethod === 'duo'
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-dark-600 hover:border-dark-500'
                          }`}
                        >
                          <Users className={`h-8 w-8 mx-auto mb-2 ${completionMethod === 'duo' ? 'text-primary-400' : 'text-dark-400'}`} />
                          <div className="text-white font-bold">Duo (+50%)</div>
                          <div className="text-dark-400 text-sm">Play with a pro booster</div>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* LoL-specific options */}
                  {gameId === 'league_of_legends' && (selectedCategory === 'division_boost' || selectedCategory === 'win_boost') && (
                    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                      <h3 className="text-lg font-bold text-white mb-4">Game Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">Flash Key</label>
                          <div className="flex gap-2">
                            {(['D', 'F'] as FlashPosition[]).map(pos => (
                              <button
                                key={pos}
                                onClick={() => setBoostConfig({ ...boostConfig, flashPosition: pos })}
                                className={`flex-1 py-3 rounded-lg font-bold text-lg transition-colors ${
                                  boostConfig.flashPosition === pos
                                    ? 'bg-primary-500 text-dark-900'
                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }`}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">Preferred Role</label>
                          <select
                            value={boostConfig.specificRole || ''}
                            onChange={(e) => setBoostConfig({ ...boostConfig, specificRole: e.target.value })}
                            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          >
                            <option value="">Any Role</option>
                            {LOL_ROLES.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-300 mb-2">Champion</label>
                          <select
                            value={boostConfig.champion || ''}
                            onChange={(e) => setBoostConfig({ ...boostConfig, champion: e.target.value })}
                            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          >
                            <option value="">Any Champion</option>
                            {LOL_CHAMPIONS.map(champ => (
                              <option key={champ} value={champ}>{champ}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Extra Options */}
                  <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h3 className="text-lg font-bold text-white mb-4">Extra Options</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                        <div>
                          <span className="text-white font-medium">Priority Order</span>
                          <p className="text-dark-400 text-sm">Your order will be completed faster (+30%)</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={boostConfig.priorityOrder || false}
                          onChange={(e) => setBoostConfig({ ...boostConfig, priorityOrder: e.target.checked })}
                          className="w-5 h-5 accent-primary-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                        <div>
                          <span className="text-white font-medium">Stream Games</span>
                          <p className="text-dark-400 text-sm">Watch your booster play live (+20%)</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={boostConfig.streamingEnabled || false}
                          onChange={(e) => setBoostConfig({ ...boostConfig, streamingEnabled: e.target.checked })}
                          className="w-5 h-5 accent-primary-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
                        <div>
                          <span className="text-white font-medium">Offline Mode</span>
                          <p className="text-dark-400 text-sm">Appear offline while boosting</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={boostConfig.offlineMode || false}
                          onChange={(e) => setBoostConfig({ ...boostConfig, offlineMode: e.target.checked })}
                          className="w-5 h-5 accent-primary-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 sticky top-24">
                    <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-dark-300">
                        <span>Game</span>
                        <span className="text-white">{getGameName()}</span>
                      </div>
                      <div className="flex justify-between text-dark-300">
                        <span>Service</span>
                        <span className="text-white">
                          {selectedCategory === 'division_boost' ? 'Division Boost' :
                           selectedCategory === 'placement' ? 'Placement Matches' :
                           selectedCategory === 'win_boost' ? 'Win Boost' : 'Coaching'}
                        </span>
                      </div>
                      <div className="flex justify-between text-dark-300">
                        <span>Server</span>
                        <span className="text-white">{boostConfig.server}</span>
                      </div>
                      {boostConfig.currentRank && (
                        <div className="flex justify-between text-dark-300">
                          <span>From</span>
                          <span className="text-white capitalize">
                            {gameConfig.ranks.find(r => r.id === boostConfig.currentRank)?.name}
                            {boostConfig.currentDivision && ` ${boostConfig.currentDivision}`}
                          </span>
                        </div>
                      )}
                      {boostConfig.desiredRank && (
                        <div className="flex justify-between text-dark-300">
                          <span>To</span>
                          <span className="text-primary-400 capitalize">
                            {gameConfig.ranks.find(r => r.id === boostConfig.desiredRank)?.name}
                            {boostConfig.desiredDivision && ` ${boostConfig.desiredDivision}`}
                          </span>
                        </div>
                      )}
                      {completionMethod === 'duo' && (
                        <div className="flex justify-between text-dark-300">
                          <span>Method</span>
                          <span className="text-white">Duo Queue</span>
                        </div>
                      )}
                      {boostConfig.priorityOrder && (
                        <div className="flex justify-between text-dark-300">
                          <span>Priority</span>
                          <span className="text-yellow-400">+30%</span>
                        </div>
                      )}
                      {boostConfig.streamingEnabled && (
                        <div className="flex justify-between text-dark-300">
                          <span>Streaming</span>
                          <span className="text-blue-400">+20%</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-dark-600 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-dark-300">Total</span>
                        <span className="text-3xl font-bold text-primary-400">${calculatePrice()}</span>
                      </div>
                    </div>
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full bg-primary-500 text-dark-900 py-4 rounded-lg font-bold hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasing ? 'Processing...' : 'Purchase Now'}
                    </button>
                    <p className="text-dark-500 text-xs text-center mt-3">
                      <Shield className="h-3 w-3 inline mr-1" />
                      Secure checkout • Money-back guarantee
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Purchase Success */}
            {isBoostingCategory(selectedCategory) && purchaseSuccess && (
              <div className="max-w-md mx-auto text-center">
                <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
                  <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
                  <p className="text-dark-400 mb-6">Your boost order has been placed successfully. A booster will claim it shortly.</p>
                  <div className="bg-dark-700 rounded-lg p-4 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-dark-400">Order Total</span>
                      <span className="text-primary-400 font-bold">${calculatePrice()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Status</span>
                      <span className="text-yellow-400">Pending</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPurchaseSuccess(false)}
                    className="w-full bg-primary-500 text-dark-900 py-3 rounded-lg font-bold hover:bg-primary-400 transition-colors"
                  >
                    Order Another Boost
                  </button>
                </div>
              </div>
            )}
            
            {/* No game config available */}
            {isBoostingCategory(selectedCategory) && !gameConfig && !loading && (
              <div className="text-center py-12">
                <Crown className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400">Boosting services are not available for this game yet.</p>
              </div>
            )}

            {/* Empty state for products */}
            {!isBoostingCategory(selectedCategory) && filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400">No products available in this category.</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="text-center py-12">
                <p className="text-dark-400">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
