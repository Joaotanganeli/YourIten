'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, ShoppingCart, Star, Package, TrendingUp, Shield, CheckCircle, User, AlertCircle, Zap, Award, Clock } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface ProductDetail {
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
  isFullAccess?: boolean
  sellerId: string
  sellerName: string
  sellerRating: number
  sellerTotalSales: number
  sellerTotalReviews: number
  sellerAvatar?: string
  sellerJoined: string
  createdAt: string
}

interface Review {
  id: string
  buyerName: string
  rating: number
  comment: string
  createdAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { user } = useAuth()
  
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (productId) {
      loadProductDetails()
    }
  }, [productId])

  const loadProductDetails = async () => {
    try {
      const [productResponse, reviewsResponse] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/products/${productId}/reviews`)
      ])
      
      if (!productResponse.ok) {
        console.error('Product not found')
        setLoading(false)
        return
      }
      
      const productData = await productResponse.json()
      const reviewsData = await reviewsResponse.json()
      
      // Convert snake_case to camelCase
      const convertedProduct: ProductDetail = {
        id: productData.id,
        title: productData.title,
        description: productData.description,
        price: typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price,
        stock: typeof productData.stock === 'string' ? parseInt(productData.stock) : productData.stock,
        imageUrl: productData.image_url,
        category: productData.category,
        game: productData.game,
        productType: productData.product_type,
        server: productData.server,
        rank: productData.rank,
        level: productData.level,
        blueEssence: productData.blue_essence,
        championsCount: productData.champions_count,
        skinsCount: productData.skins_count,
        isHandmade: productData.is_handmade,
        isRankedReady: productData.is_ranked_ready,
        isFullAccess: productData.is_full_access,
        sellerId: productData.seller_id,
        sellerName: productData.seller_name || 'Unknown Seller',
        sellerRating: productData.seller_rating ? parseFloat(productData.seller_rating) : 5.0,
        sellerTotalSales: productData.seller_total_sales || 0,
        sellerTotalReviews: productData.seller_total_reviews || 0,
        sellerAvatar: productData.seller_avatar,
        sellerJoined: productData.seller_joined,
        createdAt: productData.created_at
      }
      
      const convertedReviews = reviewsData.map((review: any) => ({
        id: review.id,
        buyerName: review.buyer_name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at
      }))
      
      setProduct(convertedProduct)
      setReviews(convertedReviews)
    } catch (error) {
      console.error('Failed to load product details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      alert('Please login to purchase')
      router.push('/login')
      return
    }

    if (user.role !== 'buyer') {
      alert('Only buyers can purchase products')
      return
    }

    if (!product) return

    if (quantity > product.stock) {
      alert('Not enough stock available')
      return
    }

    setPurchasing(true)
    try {
      await apiClient.orders.create(product.id, quantity)
      alert('Order placed successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const renderStars = (rating: number, size: string = 'h-4 w-4') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'
            }`}
          />
        ))}
      </div>
    )
  }

  const getGameName = (gameId: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-dark-400 mb-6">This product may have been removed or is out of stock.</p>
          <Link href="/" className="text-primary-400 hover:text-primary-300">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const totalPrice = product.price * quantity

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href={product.game ? `/games/${product.game}` : '/'}
            className="inline-flex items-center text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {product.game ? getGameName(product.game) : 'Home'}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Product Image & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Header */}
            <div className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-700">
              {/* Image */}
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-80 object-cover"
                />
                {product.isHandmade && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Instant delivery
                  </span>
                )}
                <span className="absolute top-4 right-4 px-3 py-1 bg-dark-900/80 text-white text-sm rounded-full">
                  {product.stock} available
                </span>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {product.server && (
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-bold rounded">
                          {product.server}
                        </span>
                      )}
                      {product.rank && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                          {product.rank}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-white">{product.title}</h1>
                  </div>
                </div>

                <p className="text-dark-300 mb-6">{product.description}</p>

                {/* Product Attributes */}
                {product.productType === 'account' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {product.blueEssence && (
                      <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                        <div className="text-primary-400 font-bold">{product.blueEssence.toLocaleString()}</div>
                        <div className="text-dark-400 text-xs">Blue Essence</div>
                      </div>
                    )}
                    {product.level && (
                      <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                        <div className="text-primary-400 font-bold">{product.level}</div>
                        <div className="text-dark-400 text-xs">Account Level</div>
                      </div>
                    )}
                    {product.championsCount && (
                      <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                        <div className="text-primary-400 font-bold">{product.championsCount}</div>
                        <div className="text-dark-400 text-xs">Champions</div>
                      </div>
                    )}
                    {product.skinsCount !== undefined && product.skinsCount > 0 && (
                      <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                        <div className="text-primary-400 font-bold">{product.skinsCount}</div>
                        <div className="text-dark-400 text-xs">Skins</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {product.isHandmade && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Handmade</span>
                  )}
                  {product.isRankedReady && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Ranked Ready</span>
                  )}
                  {product.isFullAccess && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Full Access</span>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
              <h2 className="text-lg font-bold text-white mb-4">Seller Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                  {product.sellerAvatar ? (
                    <img src={product.sellerAvatar} alt={product.sellerName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-primary-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{product.sellerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(product.sellerRating)}
                    <span className="text-yellow-400 font-bold">{product.sellerRating.toFixed(1)}</span>
                    <span className="text-dark-400 text-sm">({product.sellerTotalReviews} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{product.sellerTotalSales}</div>
                  <div className="text-dark-400 text-sm">Total Sales</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2 text-dark-300">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Verified Seller</span>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">Buyer Protection</span>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <span className="text-sm">Fast Delivery</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
                <h2 className="text-lg font-bold text-white mb-4">Customer Reviews ({reviews.length})</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-dark-700 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-dark-400" />
                          </div>
                          <span className="text-white font-medium">{review.buyerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating, 'h-3 w-3')}
                          <span className="text-dark-400 text-sm">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-dark-300 text-sm ml-10">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 sticky top-8">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${product.price.toFixed(2).split('.')[0]}</span>
                  <span className="text-xl text-dark-400">.{product.price.toFixed(2).split('.')[1]}</span>
                </div>
              </div>

              {/* Quantity */}
              {product.stock > 1 && (
                <div className="mb-6">
                  <label className="text-dark-300 text-sm mb-2 block">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-dark-700 hover:bg-dark-600 rounded-lg text-white font-bold transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="flex-1 h-10 bg-dark-700 text-white text-center rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 bg-dark-700 hover:bg-dark-600 rounded-lg text-white font-bold transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Total */}
              {quantity > 1 && (
                <div className="mb-6 p-4 bg-dark-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Total</span>
                    <span className="text-2xl font-bold text-primary-400">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Buy Button */}
              <button
                onClick={handlePurchase}
                disabled={purchasing || product.stock === 0}
                className="w-full py-4 bg-primary-500 hover:bg-primary-400 disabled:bg-dark-700 disabled:text-dark-500 text-dark-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  'Processing...'
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    Buy now <ShoppingCart className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-dark-400 text-sm">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Secure payment via SSL</span>
                </div>
                <div className="flex items-center gap-3 text-dark-400 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>100% Handmade & Safe</span>
                </div>
                <div className="flex items-center gap-3 text-dark-400 text-sm">
                  <Award className="h-4 w-4 text-green-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
