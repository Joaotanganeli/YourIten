'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Zap, User, LogOut, Menu, X, Gamepad2 } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'seller': return 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
      case 'buyer': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'booster': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      case 'admin': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default: return 'bg-dark-700 text-dark-300'
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-dark-900" />
            </div>
            <span className="text-xl font-bold text-white">YourIten</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/products" 
              className="text-dark-300 hover:text-primary-400 transition-colors"
            >
              Products
            </Link>
            <Link 
              href="/services" 
              className="text-dark-300 hover:text-primary-400 transition-colors flex items-center space-x-1"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Boosting</span>
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-dark-700">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-dark-400" />
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="text-dark-300 hover:text-primary-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-primary-600 text-dark-900 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors font-semibold"
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
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/products" 
                className="text-dark-300 hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/services" 
                className="text-dark-300 hover:text-primary-400 transition-colors flex items-center space-x-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Boosting Services</span>
              </Link>
              
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-dark-300 hover:text-primary-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="pt-3 border-t border-dark-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="h-5 w-5 text-dark-400" />
                      <span className="text-sm font-medium text-white">{user.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-1 text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-3 border-t border-dark-700">
                  <Link 
                    href="/login" 
                    className="text-dark-300 hover:text-primary-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-primary-600 text-dark-900 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors text-center font-semibold"
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
