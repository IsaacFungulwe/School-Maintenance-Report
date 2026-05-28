import api from '../utils/api'

export const locationApi = {
  // Get all locations
  getAll: () =>
    api.get('/locations'),

  // Create new location
  create: (locationData) =>
    api.post('/locations', locationData),

  // Delete location
  delete: (id) =>
    api.delete(`/locations/${id}`),
}
