'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'

export default function ProductsPage() {
  const router = useRouter()

  useEffect(() => {
    // Products are now accessed through game pages
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Package className="h-16 w-16 text-primary-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2">Redirecting...</h2>
        <p className="text-dark-400">Products are now accessed through game pages.</p>
        <p className="text-dark-500 text-sm mt-2">Select a game to browse products and services.</p>
      </div>
    </div>
  )
}
