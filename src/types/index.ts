export type UserRole = 'buyer' | 'seller' | 'booster' | 'admin'

export type GameCategory = 'league_of_legends' | 'valorant' | 'deadlock' | 'dota2' | 'clash_royale' | 'arc_raiders'

export type ServiceType = 'elo_boost' | 'duo_boost' | 'account_level' | 'mastery' | 'placement' | 'account' | 'currency' | 'coaching'

export type EloRank = 
  | 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'emerald' | 'diamond' | 'master' | 'grandmaster' | 'challenger'
  | 'radiant' | 'immortal' | 'ascendant'
  | 'herald' | 'guardian' | 'crusader' | 'archon' | 'legend' | 'ancient' | 'divine' | 'immortal_dota'

export type FlashPosition = 'D' | 'F'

export interface BoostConfig {
  currentRank?: EloRank
  currentDivision?: number
  desiredRank?: EloRank
  desiredDivision?: number
  flashPosition?: FlashPosition
  preferredChampions?: string[]
  duoQueue?: boolean
  priorityOrder?: boolean
  streamingEnabled?: boolean
  offlineMode?: boolean
  specificRole?: string
  currentLevel?: number
  desiredLevel?: number
  currentMastery?: number
  desiredMastery?: number
  champion?: string
}

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
  basePrice: number
  pricePerDivision?: number
  imageUrl: string
  availableOptions?: string[]
  isActive: boolean
  isFeatured?: boolean
  isHotOffer?: boolean
  viewCount?: number
  orderCount?: number
  weeklyOrderCount?: number
  displayOrder?: number
  createdAt: string
}

export interface BoostOrder {
  id: string
  serviceId: string
  service: FixedService
  game: GameCategory
  serviceType: ServiceType
  buyerId: string
  buyerName: string
  buyerEmail: string
  boosterId?: string
  boosterName?: string
  status: 'pending' | 'claimed' | 'in_progress' | 'completed' | 'cancelled'
  boostConfig: BoostConfig
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
