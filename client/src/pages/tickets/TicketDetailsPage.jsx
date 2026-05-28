import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Clock, MapPin, User } from 'lucide-react'
import { DashboardLayout } from '../../layouts'
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { Alert } from '../../components/common/Alert'
import { StatusBadge } from '../../components/common/Badge'
import { SkeletonLoader, Spinner } from '../../components/common/Loaders'
import { ticketApi } from '../../api/ticketApi'
import { noteApi } from '../../api/noteApi'
import toast from 'react-hot-toast'

export const TicketDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [ticketRes, notesRes] = await Promise.all([
          ticketApi.getById(id),
          noteApi.getAll({ ticket_id: id }),
        ])
        setTicket(ticketRes.data)
        setNotes(notesRes.data)
        setNewStatus(ticketRes.data.status)
      } catch (error) {
        toast.error('Failed to load ticket details')
        navigate('/student/tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      setSubmittingNote(true)
      const res = await noteApi.create({
        ticket_id: id,
        content: newNote,
      })
      setNotes((prev) => [...prev, res.data])
      setNewNote('')
      toast.success('Note added successfully')
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setSubmittingNote(false)
    }
  }

  const handleStatusChange = async () => {
    try {
      await ticketApi.updateStatus(id, newStatus)
      setTicket((prev) => ({ ...prev, status: newStatus }))
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      setNewStatus(ticket.status)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8">
          <SkeletonLoader count={5} height="h-24" className="mb-4" />
        </div>
      </DashboardLayout>
    )
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8">
          <Alert type="error" message="Ticket not found" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8">
        <button
          onClick={() => navigate('/student/tickets')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          Back to Tickets
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {ticket.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ticket #{ticket.id}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {ticket.description}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin size={18} />
                    <span>{ticket.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock size={18} />
                    <span>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={20} />
                  Comments & Notes
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4 mb-6">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {note.author}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {note.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      No comments yet
                    </p>
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-3">
                  <Input
                    placeholder="Add a comment or note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={submittingNote}
                    disabled={!newNote.trim()}
                  >
                    Post Comment
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status
                </h3>
              </CardHeader>
              <CardBody>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={[
                    { value: 'open', label: 'Open' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                />
                {newStatus !== ticket.status && (
                  <Button
                    onClick={handleStatusChange}
                    variant="primary"
                    size="sm"
                    className="w-full mt-3"
                  >
                    Update Status
                  </Button>
                )}
              </CardBody>
            </Card>

            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Information
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Priority
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {ticket.priority || 'Normal'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Created
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Assigned To
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {ticket.technician || 'Unassigned'}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
