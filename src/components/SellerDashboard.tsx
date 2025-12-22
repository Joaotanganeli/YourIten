'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Product, Order } from '@/types'
import { Plus, Package, ShoppingCart, DollarSign, Edit, Trash2, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export default function SellerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: ''
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    try {
      const [productsData, ordersData] = await Promise.all([
        apiClient.products.list(),
        apiClient.orders.list('seller')
      ])
      setProducts(productsData.filter((p: Product) => p.sellerId === user.id))
      setOrders(ordersData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const productData = {
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        stock: parseInt(productForm.stock),
        imageUrl: productForm.imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`
      }

      if (editingProduct) {
        await apiClient.products.update(editingProduct.id, productData)
      } else {
        await apiClient.products.create(productData)
      }

      resetForm()
      await loadData()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Failed to save product. Please try again.')
    }
  }

  const resetForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      imageUrl: ''
    })
    setEditingProduct(null)
    setShowProductModal(false)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      imageUrl: product.imageUrl
    })
    setShowProductModal(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await apiClient.products.delete(productId)
      await loadData()
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Failed to delete product. Please try again.')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await apiClient.orders.updateStatus(orderId, status)
      await loadData()
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status. Please try again.')
    }
  }

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0)

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Products</p>
              <p className="text-2xl font-bold text-white">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Revenue</p>
              <p className="text-2xl font-bold text-primary-400">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-dark-800 rounded-xl border border-dark-700">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">My Products</h2>
          <button
            onClick={() => setShowProductModal(true)}
            className="flex items-center space-x-2 bg-primary-500 text-dark-900 px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors font-bold"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>
        <div className="p-6">
          {products.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No products yet. Add your first product!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="border border-dark-700 rounded-lg overflow-hidden bg-dark-800/50">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{product.title}</h3>
                    <p className="text-sm text-dark-400 mt-1">{product.category}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-primary-400">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-dark-400">Stock: {product.stock}</span>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-dark-700 text-dark-300 px-3 py-2 rounded-lg hover:bg-dark-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-dark-800 rounded-xl border border-dark-700">
        <div className="p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Orders Received</h2>
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-dark-700 rounded-lg p-4 bg-dark-800/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{order.productTitle}</h3>
                      <p className="text-sm text-dark-400">Buyer: {order.buyerName}</p>
                      <p className="text-sm text-dark-400">Quantity: {order.quantity}</p>
                      <p className="text-lg font-bold text-primary-400 mt-2">${order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        className={`px-3 py-1 rounded-full text-sm font-medium border cursor-pointer ${
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <p className="text-xs text-dark-500 mt-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-dark-700">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={resetForm} className="text-dark-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Title</label>
                <input
                  type="text"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white placeholder-dark-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-500 text-dark-900 py-3 rounded-lg font-bold hover:bg-primary-400 transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
