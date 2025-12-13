'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Product, Order } from '@/types'
import { Plus, Package, ShoppingCart, DollarSign, Edit, Trash2, X } from 'lucide-react'

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

  const loadData = () => {
    if (!user) return
    
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]')
    const myProducts = allProducts.filter((p: Product) => p.sellerId === user.id)
    setProducts(myProducts)

    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const myOrders = allOrders.filter((o: Order) => o.sellerId === user.id)
    setOrders(myOrders)
  }

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const allProducts = JSON.parse(localStorage.getItem('products') || '[]')

    if (editingProduct) {
      const updatedProducts = allProducts.map((p: Product) =>
        p.id === editingProduct.id
          ? {
              ...p,
              title: productForm.title,
              description: productForm.description,
              price: parseFloat(productForm.price),
              category: productForm.category,
              stock: parseInt(productForm.stock),
              imageUrl: productForm.imageUrl || `https://picsum.photos/seed/${p.id}/400/300`
            }
          : p
      )
      localStorage.setItem('products', JSON.stringify(updatedProducts))
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        sellerId: user.id,
        sellerName: user.name,
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        stock: parseInt(productForm.stock),
        imageUrl: productForm.imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`,
        createdAt: new Date().toISOString()
      }
      allProducts.push(newProduct)
      localStorage.setItem('products', JSON.stringify(allProducts))
    }

    resetForm()
    loadData()
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

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]')
    const updatedProducts = allProducts.filter((p: Product) => p.id !== productId)
    localStorage.setItem('products', JSON.stringify(updatedProducts))
    loadData()
  }

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const updatedOrders = allOrders.map((o: Order) =>
      o.id === orderId ? { ...o, status } : o
    )
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    loadData()
  }

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0)

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">My Products</h2>
          <button
            onClick={() => setShowProductModal(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>
        <div className="p-6">
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products yet. Add your first product!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{product.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-primary-600">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
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
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Orders Received</h2>
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.productTitle}</h3>
                      <p className="text-sm text-gray-500">Buyer: {order.buyerName}</p>
                      <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                      <p className="text-lg font-bold text-primary-600 mt-2">${order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
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
