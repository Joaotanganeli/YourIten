export type UserRole = 'buyer' | 'seller' | 'booster' | 'admin'

export type GameCategory = 'league_of_legends' | 'valorant' | 'deadlock'

export type ServiceType = 'rank_boost' | 'account' | 'gold'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  gameCategories?: GameCategory[]
  createdAt: string
}

export interface Product {
  id: string
  sellerId: string
  sellerName: string
  title: string
  description: string
  price: number
  imageUrl: string
  category: string
  stock: number
  createdAt: string
}

export interface FixedService {
  id: string
  game: GameCategory
  serviceType: ServiceType
  title: string
  description: string
  price: number
  imageUrl: string
  details: Record<string, string>
  isActive: boolean
  createdAt: string
}

export interface BoostOrder {
  id: string
  serviceId: string
  service: FixedService
  buyerId: string
  buyerName: string
  buyerEmail: string
  boosterId?: string
  boosterName?: string
  status: 'pending' | 'claimed' | 'in_progress' | 'completed' | 'cancelled'
  orderDetails: Record<string, string>
  totalPrice: number
  createdAt: string
  claimedAt?: string
  completedAt?: string
}

export interface BoosterNotification {
  id: string
  boostOrderId: string
  game: GameCategory
  serviceType: ServiceType
  title: string
  price: number
  createdAt: string
  isRead: boolean
}

export interface Order {
  id: string
  productId: string
  productTitle: string
  productPrice: number
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  quantity: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, role: UserRole, gameCategories?: GameCategory[]) => Promise<boolean>
  logout: () => void
}
