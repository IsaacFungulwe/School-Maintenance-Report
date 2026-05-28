import api from '../utils/api'

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
