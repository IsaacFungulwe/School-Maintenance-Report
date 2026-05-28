import api from '../utils/api'

export const noteApi = {
  // Get all notes (usually for a ticket)
  getAll: (params) =>
    api.get('/notes', { params }),

  // Create new note
  create: (noteData) =>
    api.post('/notes', noteData),
}
