import React, { createContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios' // Fixed the package name here

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Track backend server URL cleanly to route completely away from port 5173
  const BACKEND_URL = 'http://127.0.0.1:5000'

  // Initialize auth state from localStorage on application mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setUser(response.data)
          setError(null)
        } catch (err) {
          localStorage.removeItem('authToken')
          setUser(null)
          setError('Failed to restore session')
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [BACKEND_URL])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password,
      })
      const { token, user } = response.data
      localStorage.setItem('authToken', token)
      setUser(user)
      return user
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [BACKEND_URL])

  const register = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, data)
      const { token, user } = response.data
      localStorage.setItem('authToken', token)
      setUser(user)
      return user
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [BACKEND_URL])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    setUser(null)
    setError(null)
  }, [])

  const isAuthenticated = !!user
  
  const hasRole = (roles) => {
    if (!user) return false
    if (typeof roles === 'string') return user.role === roles
    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}