'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { FixedService } from '@/types'
import { ArrowLeft, TrendingUp, Star, Zap, Shield, CheckCircle, User, Search, Coins, Package, ChevronRight } from 'lucide-react'

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

  const isBoostingCategory = (cat: CategoryType) => {
    return ['division_boost', 'placement', 'win_boost', 'coaching'].includes(cat)
  }

  useEffect(() => {
    loadData()
  }, [gameId, selectedCategory])

  const loadData = async () => {
    setLoading(true)
    try {
      if (isBoostingCategory(selectedCategory)) {
        const response = await fetch(`/api/services?game=${gameId}&activeOnly=true`)
        const data = await response.json()
        setServices(data)
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

            {/* Services Grid (for boosting categories) */}
            {isBoostingCategory(selectedCategory) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service.id)}
                    className="bg-dark-800 rounded-xl border border-dark-700 p-6 hover:border-primary-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{service.title}</h3>
                        <p className="text-dark-400 text-sm mb-3 line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-primary-400">${service.basePrice}</span>
                            <span className="text-dark-400 text-sm ml-1">from</span>
                          </div>
                          <button className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold rounded-lg transition-colors text-sm">
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredServices.length === 0 && !loading && (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-dark-400">No services available in this category.</p>
                  </div>
                )}
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
