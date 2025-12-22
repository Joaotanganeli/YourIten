'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, UserPlus, AlertCircle, ShoppingBag, Store, Gamepad2, Swords, Target, Crosshair } from 'lucide-react'
import { UserRole, GameCategory } from '@/types'

const GAME_OPTIONS: { id: GameCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'league_of_legends', name: 'League of Legends', icon: <Swords className="h-5 w-5" /> },
  { id: 'valorant', name: 'Valorant', icon: <Crosshair className="h-5 w-5" /> },
  { id: 'deadlock', name: 'Deadlock', icon: <Target className="h-5 w-5" /> }
]

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('buyer')
  const [selectedGames, setSelectedGames] = useState<GameCategory[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const toggleGame = (game: GameCategory) => {
    setSelectedGames(prev => 
      prev.includes(game) 
        ? prev.filter(g => g !== game)
        : [...prev, game]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (role === 'booster' && selectedGames.length === 0) {
      setError('Please select at least one game category')
      return
    }

    setIsLoading(true)

    const success = await register(email, password, name, role, role === 'booster' ? selectedGames : undefined)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Email already exists')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-dark-400 mt-2">Join YourIten marketplace</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">
                I want to register as
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-1 ${
                    role === 'buyer'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-dark-600 hover:border-dark-500 text-dark-300'
                  }`}
                >
                  <ShoppingBag className={`h-6 w-6 ${role === 'buyer' ? 'text-primary-400' : 'text-dark-500'}`} />
                  <span className="font-medium text-sm">Buyer</span>
                  <span className="text-xs text-dark-500">Purchase</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-1 ${
                    role === 'seller'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-dark-600 hover:border-dark-500 text-dark-300'
                  }`}
                >
                  <Store className={`h-6 w-6 ${role === 'seller' ? 'text-primary-400' : 'text-dark-500'}`} />
                  <span className="font-medium text-sm">Seller</span>
                  <span className="text-xs text-dark-500">Sell items</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('booster')}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-1 ${
                    role === 'booster'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-dark-600 hover:border-dark-500 text-dark-300'
                  }`}
                >
                  <Gamepad2 className={`h-6 w-6 ${role === 'booster' ? 'text-purple-400' : 'text-dark-500'}`} />
                  <span className="font-medium text-sm">Booster</span>
                  <span className="text-xs text-dark-500">Boost ranks</span>
                </button>
              </div>
            </div>

            {role === 'booster' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">
                  Select games you can boost
                </label>
                <div className="space-y-2">
                  {GAME_OPTIONS.map(game => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => toggleGame(game.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                        selectedGames.includes(game.id)
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                          : 'border-dark-600 hover:border-dark-500 text-dark-300'
                      }`}
                    >
                      <div className={selectedGames.includes(game.id) ? 'text-purple-400' : 'text-dark-500'}>
                        {game.icon}
                      </div>
                      <span className="font-medium">{game.name}</span>
                      {selectedGames.includes(game.id) && (
                        <span className="ml-auto text-purple-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white placeholder-dark-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white placeholder-dark-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white placeholder-dark-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white placeholder-dark-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 text-dark-900 py-3 rounded-lg font-bold hover:bg-primary-400 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-400 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
