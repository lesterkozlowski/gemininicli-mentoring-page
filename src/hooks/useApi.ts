import { useState, useEffect } from 'react'

// Use current origin for API calls - works for both dev and production
// Empty base URL since endpoints already include /api/
const API_BASE_URL = ''

// Simple token - in production this would be properly managed
const AUTH_TOKEN = 'demo-token'

interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Ensure components can pass endpoints without worrying about the /api prefix
function normalizeEndpoint(endpoint: string): string {
  if (!endpoint) return '/api'
  // Absolute URLs are left as-is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return path.startsWith('/api/') ? path : `/api${path}`
}

async function apiCall<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${normalizeEndpoint(endpoint)}`
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }

  return response.json()
}

// General-purpose API client for POST/PUT/DELETE or custom GETs.
// Returns the raw Response so callers can handle status and parse as needed.
export async function api(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE_URL}${normalizeEndpoint(endpoint)}`
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as Record<string, string>

  return fetch(url, {
    ...options,
    headers,
  })
}

export function useApi<T>(endpoint: string): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall<T>(endpoint)
        
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [endpoint])

  return { data, loading, error }
}

export { apiCall }