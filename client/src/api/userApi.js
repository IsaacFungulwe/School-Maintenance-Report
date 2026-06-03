import axios from 'axios'

// Hardcode the backend base URL for local development and clean compilation
const API_URL = 'http://127.0.0.1:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach administrative authentication token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const userApi = {
  // Get all users
  getAll: (params) =>
    api.get('/users', { params }),

  // Create new user
  create: (userData) =>
    api.post('/users', userData),

  // Update user role
  updateRole: (id, role) =>
    api.patch(`/users/${id}/role`, { role }),

  // Deactivate user
  deactivate: (id) =>
    api.patch(`/users/${id}/deactivate`),
}