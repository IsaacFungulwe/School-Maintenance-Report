import api from '../utils/api'

export const ticketApi = {
  // Get ticket statistics
  getStats: () =>
    api.get('/tickets/stats'),

  // Get all tickets (with optional filters)
  getAll: (params) =>
    api.get('/tickets', { params }),

  // Get single ticket
  getById: (id) =>
    api.get(`/tickets/${id}`),

  // Create new ticket
  create: (ticketData) =>
    api.post('/tickets', ticketData),

  // Update ticket status
  updateStatus: (id, status) =>
    api.patch(`/tickets/${id}/status`, { status }),

  // Assign ticket to technician
  assign: (id, technicianId) =>
    api.patch(`/tickets/${id}/assign`, { technician_id: technicianId }),

  // Delete ticket
  delete: (id) =>
    api.delete(`/tickets/${id}`),
}
