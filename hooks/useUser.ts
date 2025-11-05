'use client';

import { useState, useEffect } from 'react'
import { User } from '@/types/database'
import { authApi } from '@/utils/api'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.getCurrentUser() as { user: User }
      setUser(response.user)
    } catch (err: any) {
      setUser(null)
      setError(err.message || 'Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await authApi.login(email, password) as { user: User }
      setUser(response.user)
      return response
    } catch (err: any) {
      setError(err.message || 'Login failed')
      throw err
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(null)
    } catch (err: any) {
      setError(err.message || 'Logout failed')
      throw err
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
  }
}
