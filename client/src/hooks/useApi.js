import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (apiCall, successMessage = null, errorMessage = null) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall()
      if (successMessage) {
        toast.success(successMessage)
      }
      return response
    } catch (err) {
      const message = errorMessage || err.response?.data?.message || err.message || 'An error occurred'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, request }
}
