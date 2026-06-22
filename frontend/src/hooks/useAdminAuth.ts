import { useState, useCallback, createContext, useContext } from 'react'
import React from 'react'

interface AdminAuthCtx {
  isAuthenticated: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  error: string | null
  loading: boolean
}

export const AdminAuthContext = createContext<AdminAuthCtx>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => undefined,
  error: null,
  loading: false,
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('admin_token'))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await res.json()) as { token?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return false
      }
      sessionStorage.setItem('admin_token', data.token!)
      setToken(data.token!)
      return true
    } catch {
      setError('Could not reach the server')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('admin_token')
    setToken(null)
    setError(null)
  }, [])

  return React.createElement(
    AdminAuthContext.Provider,
    { value: { isAuthenticated: !!token, login, logout, error, loading } },
    children
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
