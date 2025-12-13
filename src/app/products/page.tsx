'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Product, Order } from '@/types'
import { Search, Filter, ShoppingCart, X, Minus, Plus } from 'lucide-react'

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const categories = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Other']

  useEffect(() => {
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]')
    setProducts(allProducts)
    setFilteredProducts(allProducts)
  }, [])

  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])

  const handleBuyClick = (product: Product) => {
    if (!user) {
      alert('Please login to purchase products')
      return
    }
    if (user.role === 'seller') {
      alert('Sellers cannot purchase products. Please create a buyer account.')
      return
    }
    setSelectedProduct(product)
    setQuantity(1)
    setShowPurchaseModal(true)
    setPurchaseSuccess(false)
  }

  const handlePurchase = () => {
    if (!user || !selectedProduct) return

    const newOrder: Order = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productPrice: selectedProduct.price,
      buyerId: user.id,
      buyerName: user.name,
      sellerId: selectedProduct.sellerId,
      sellerName: selectedProduct.sellerName,
      quantity: quantity,
      totalPrice: selectedProduct.price * quantity,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(newOrder)
    localStorage.setItem('orders', JSON.stringify(orders))

    const allProducts = JSON.parse(localStorage.getItem('products') || '[]')
    const updatedProducts = allProducts.map((p: Product) =>
      p.id === selectedProduct.id
        ? { ...p, stock: p.stock - quantity }
        : p
    )
    localStorage.setItem('products', JSON.stringify(updatedProducts))
    setProducts(updatedProducts)

    setPurchaseSuccess(true)
  }

  const closeModal = () => {
    setShowPurchaseModal(false)
    setSelectedProduct(null)
    setQuantity(1)
    setPurchaseSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Browse our marketplace</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
                    <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Sold by: {product.sellerName}</p>
                  <button
                    onClick={() => handleBuyClick(product)}
                    disabled={product.stock === 0}
                    className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && selectedProduct && (
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
                    <ShoppingCart className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for your order!</h3>
                  <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
                  <button
                    onClick={closeModal}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex space-x-4 mb-6">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedProduct.title}</h3>
                      <p className="text-sm text-gray-500">{selectedProduct.category}</p>
                      <p className="text-lg font-bold text-primary-600 mt-2">
                        ${selectedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedProduct.stock} available
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary-600">
                        ${(selectedProduct.price * quantity).toFixed(2)}
                      </span>
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
