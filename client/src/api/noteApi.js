import api from '../utils/api'

export const noteApi = {
  // Get all notes for a specific ticket
  getAll: (ticketId) =>
    api.get(`/tickets/${ticketId}/notes`),

  // Create new note for a specific ticket
  create: (ticketId, noteData) =>
    api.post(`/tickets/${ticketId}/notes`, noteData),
}
