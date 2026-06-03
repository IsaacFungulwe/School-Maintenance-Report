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

  // Create new ticket (Dynamically scales to support Multipart/FormData file payloads)
  create: (ticketData) =>
    api.post('/tickets', ticketData, {
      headers: {
        // If ticketData is an instance of FormData, pass null/multipart configuration flags 
        // to let the browser safely format bound parameters and boundary offsets.
        'Content-Type': ticketData instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    }),

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