const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function convertNumericFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => convertNumericFields(item))
  }
  
  if (obj && typeof obj === 'object') {
    const converted: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = toCamelCase(key)
      
      // Convert numeric fields
      if (key === 'price' || key === 'base_price' || 
          key === 'price_per_division' || 
          key === 'total_price' || key === 'product_price') {
        converted[camelKey] = typeof value === 'string' ? parseFloat(value) : value
      } else if (key === 'stock' || key === 'quantity') {
        converted[camelKey] = typeof value === 'string' ? parseInt(value) : value
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        converted[camelKey] = convertNumericFields(value)
      } else if (Array.isArray(value)) {
        converted[camelKey] = value.map(item => 
          typeof item === 'object' ? convertNumericFields(item) : item
        )
      } else {
        converted[camelKey] = value
      }
    }
    return converted
  }
  
  return obj
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new ApiError(response.status, error.error || 'Request failed')
  }

  const data = await response.json()
  return convertNumericFields(data)
}

export const apiClient = {
  auth: {
    login: (email: string, password: string) =>
      fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name: string, role: string, gameCategories?: string[]) =>
      fetchWithAuth('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role, gameCategories }),
      }),
  },

  products: {
    list: (params?: { category?: string; search?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.category) searchParams.append('category', params.category)
      if (params?.search) searchParams.append('search', params.search)
      const query = searchParams.toString()
      return fetchWithAuth(`/api/products${query ? `?${query}` : ''}`)
    },
    get: (id: string) => fetchWithAuth(`/api/products/${id}`),
    create: (data: any) =>
      fetchWithAuth('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchWithAuth(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/api/products/${id}`, {
        method: 'DELETE',
      }),
  },

  orders: {
    list: (role?: string) => {
      const query = role ? `?role=${role}` : ''
      return fetchWithAuth(`/api/orders${query}`)
    },
    create: (productId: string, quantity: number) =>
      fetchWithAuth('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    updateStatus: (id: string, status: string) =>
      fetchWithAuth(`/api/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  services: {
    list: (params?: { game?: string; serviceType?: string; activeOnly?: boolean }) => {
      const searchParams = new URLSearchParams()
      if (params?.game) searchParams.append('game', params.game)
      if (params?.serviceType) searchParams.append('serviceType', params.serviceType)
      if (params?.activeOnly) searchParams.append('activeOnly', 'true')
      const query = searchParams.toString()
      return fetchWithAuth(`/api/services${query ? `?${query}` : ''}`)
    },
    create: (data: any) =>
      fetchWithAuth('/api/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchWithAuth(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/api/services/${id}`, {
        method: 'DELETE',
      }),
    toggleActive: (id: string, isActive: boolean) =>
      fetchWithAuth(`/api/services/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
  },

  boostOrders: {
    list: (params?: { role?: string; status?: string; game?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.role) searchParams.append('role', params.role)
      if (params?.status) searchParams.append('status', params.status)
      if (params?.game) searchParams.append('game', params.game)
      const query = searchParams.toString()
      return fetchWithAuth(`/api/boost-orders${query ? `?${query}` : ''}`)
    },
    create: (serviceId: string, boostConfig: any, totalPrice: number) =>
      fetchWithAuth('/api/boost-orders', {
        method: 'POST',
        body: JSON.stringify({ serviceId, boostConfig, totalPrice }),
      }),
    claim: (id: string) =>
      fetchWithAuth(`/api/boost-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'claim' }),
      }),
    updateStatus: (id: string, status: string) =>
      fetchWithAuth(`/api/boost-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
}
