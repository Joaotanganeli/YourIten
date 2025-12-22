'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ShoppingBag, Store, ArrowRight, Gamepad2, Trophy, Coins, User, Zap, Swords, Target, Crosshair, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface GameCategory {
  id: string
  name: string
  description: string
  imageUrl: string
  bannerUrl: string
  iconName: string
  totalOffers: number
  isActive: boolean
  displayOrder: number
}

export default function Home() {
  const { user } = useAuth()
  const [games, setGames] = useState<GameCategory[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()
      setGames(data)
    } catch (error) {
      console.error('Failed to load games:', error)
    } finally {
      setLoading(false)
    }
  }

  const heroSlides = [
    {
      title: 'CHRISTMAS SALE',
      subtitle: 'Special Holiday Offers',
      image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&h=600&fit=crop',
      cta: 'Discover Deals'
    },
    {
      title: 'NEW SEASON',
      subtitle: 'Rank Up Fast',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop',
      cta: 'Start Boosting'
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Swords, Crosshair, Target, Gamepad2, Trophy, Zap
    }
    return icons[iconName] || Gamepad2
  }

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <div className="relative h-[500px] overflow-hidden bg-dark-900">
        <div className="absolute inset-0">
          <img 
            src={heroSlides[currentSlide].image} 
            alt="Hero" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/80 to-transparent" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl text-dark-300 mb-8">{heroSlides[currentSlide].subtitle}</p>
            <button className="px-8 py-4 bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold rounded-lg transition-all transform hover:scale-105">
              {heroSlides[currentSlide].cta}
            </button>
          </div>
        </div>

        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark-800/80 hover:bg-dark-700 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark-800/80 hover:bg-dark-700 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-primary-500 w-8' : 'bg-dark-600'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {games.slice(0, 4).map((game) => {
            const Icon = getIcon(game.iconName)
            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group relative bg-dark-800 rounded-xl overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all"
              >
                <div className="aspect-video relative">
                  <img 
                    src={game.imageUrl} 
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="h-5 w-5 text-primary-400" />
                      <h3 className="text-white font-bold text-lg">{game.name}</h3>
                    </div>
                    <p className="text-xs text-dark-400">{game.totalOffers} offers</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* More Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {games.slice(4).map((game) => {
            const Icon = getIcon(game.iconName)
            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group relative bg-dark-800 rounded-xl overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all h-32"
              >
                <div className="absolute inset-0">
                  <img 
                    src={game.imageUrl} 
                    alt={game.name}
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-900/50" />
                </div>
                <div className="relative h-full flex items-center px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-dark-800/80 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{game.name}</h3>
                      <p className="text-xs text-dark-400">{game.totalOffers} offers</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
