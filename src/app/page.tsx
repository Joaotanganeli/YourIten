'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ShoppingBag, Store, ArrowRight, Gamepad2, Trophy, Coins, User } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">YourIten</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Your one-stop marketplace for products and gaming services. Buy, sell, or boost!
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border border-primary-200"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Gaming Services Banner */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-2">Gaming Boosting Services</h2>
              <p className="text-purple-100">Rank boosts, accounts, and in-game currency for LoL, Valorant & Deadlock</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/services"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                Browse Services
              </Link>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-purple-100">
              <Trophy className="h-5 w-5" />
              <span>Rank Boosting</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-100">
              <User className="h-5 w-5" />
              <span>Smurf Accounts</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-100">
              <Coins className="h-5 w-5" />
              <span>In-Game Currency</span>
            </div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Buyers</h3>
            <p className="text-gray-600 mb-6">
              Browse products and gaming services. Purchase with confidence.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                Shop products & services
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                Track your orders
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                Secure transactions
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Store className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Sellers</h3>
            <p className="text-gray-600 mb-6">
              List your products and reach thousands of potential buyers.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Create product listings
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Manage your orders
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Track your sales
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Gamepad2 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Boosters</h3>
            <p className="text-gray-600 mb-6">
              Earn money by completing boost orders for your favorite games.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Claim boost orders
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Choose your games
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Earn 70% commission
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
