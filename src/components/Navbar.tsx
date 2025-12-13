'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingBag, User, LogOut, Menu, X, Gamepad2 } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'seller': return 'bg-green-100 text-green-700'
      case 'buyer': return 'bg-blue-100 text-blue-700'
      case 'booster': return 'bg-purple-100 text-purple-700'
      case 'admin': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">YourIten</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/products" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Products
            </Link>
            <Link 
              href="/services" 
              className="text-gray-600 hover:text-primary-600 transition-colors flex items-center space-x-1"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Boosting</span>
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/products" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/services" 
                className="text-gray-600 hover:text-primary-600 transition-colors flex items-center space-x-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Boosting Services</span>
              </Link>
              
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                  <Link 
                    href="/login" 
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
