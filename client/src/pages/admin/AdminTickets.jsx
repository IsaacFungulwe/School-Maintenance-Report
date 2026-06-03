import React, { useState, useEffect, useCallback } from 'react'
import { Trash2, CheckCircle, Users, Edit2 } from 'lucide-react'
import { DashboardLayout } from '../../layouts'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { Modal } from '../../components/common/Modal'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export const AdminTickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
  })
  const [technicians, setTechnicians] = useState([])
  const [assignToId, setAssignToId] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [assigningLoading, setAssigningLoading] = useState(false)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)

      const res = await api.get(`/tickets?${params}`)
      setTickets(res.data || [])
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchTechnicians = useCallback(async () => {
    try {
      const res = await api.get('/users', { params: { role: 'technician' } })
      setTechnicians(res.data || [])
    } catch (error) {
      console.error('Failed to fetch technicians:', error)
      toast.error('Could not populate technician assignment listings.')
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [filters.status, filters.priority, filters.category, fetchTickets])

  // Separate effect with a minor debounce window for search text typing input pipelines
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTickets()
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [filters.search, fetchTickets])

  useEffect(() => {
    fetchTechnicians()
  }, [fetchTechnicians])

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(tickets.map((t) => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const bulkAssign = async () => {
    if (!assignToId) {
      toast.error('Please select a technician')
      return
    }
    try {
      const res = await api.post('/tickets/bulk-assign', {
        ticket_ids: Array.from(selectedIds),
        technician_id: parseInt(assignToId, 10),
      })
      toast.success(`Assigned ${res.data.updated || selectedIds.size} tickets`)
      setSelectedIds(new Set())
      setAssignToId('')
      fetchTickets()
    } catch (error) {
      toast.error('Failed to execute bulk assignment batch.')
    }
  }

  const bulkClose = async () => {
    if (window.confirm(`Close ${selectedIds.size} tickets?`)) {
      try {
        const res = await api.post('/tickets/bulk-close', {
          ticket_ids: Array.from(selectedIds),
        })
        toast.success(`Closed ${res.data.updated || selectedIds.size} tickets`)
        setSelectedIds(new Set())
        fetchTickets()
      } catch (error) {
        toast.error('Failed to close tickets')
      }
    }
  }

  const bulkDelete = async () => {
    if (window.confirm(`Delete ${selectedIds.size} tickets? This cannot be undone.`)) {
      try {
        const res = await api.post('/tickets/bulk-delete', {
          ticket_ids: Array.from(selectedIds),
        })
        toast.success(`Deleted ${res.data.deleted || selectedIds.size} tickets`)
        setSelectedIds(new Set())
        fetchTickets()
      } catch (error) {
        toast.error('Failed to delete tickets')
      }
    }
  }

  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket)
    setAssignToId('')
    setShowAssignModal(true)
  }

  const closeAssignModal = () => {
    setShowAssignModal(false)
    setSelectedTicket(null)
    setAssignToId('')
  }

  const assignToTechnician = async () => {
    if (!assignToId) {
      toast.error('Please select a technician')
      return
    }
    if (!selectedTicket) {
      toast.error('No ticket selected')
      return
    }

    try {
      setAssigningLoading(true)
      await api.patch(`/tickets/${selectedTicket.id}/assign`, {
        technician_id: parseInt(assignToId, 10),
      })
      toast.success(`Assigned to ${technicians.find(t => t.id == assignToId)?.name}`)
      closeAssignModal()
      fetchTickets()
    } catch (error) {
      toast.error('Failed to assign ticket')
    } finally {
      setAssigningLoading(false)
    }
  }

  const calculateSLA = (createdAt, priority) => {
    const created = new Date(createdAt)
    const now = new Date()
    const slaHours = priority === 'urgent' ? 4 : priority === 'high' ? 24 : priority === 'medium' ? 72 : 168
    const dueDate = new Date(created.getTime() + slaHours * 60 * 60 * 1000)
    const hoursRemaining = (dueDate - now) / (60 * 60 * 1000)

    return {
      dueDate,
      hoursRemaining,
      isOverdue: hoursRemaining < 0,
      color: hoursRemaining < 0 ? 'red' : hoursRemaining < slaHours / 2 ? 'amber' : 'green',
    }
  }

  const statusColor = (status) => {
    const colorMap = {
      open: 'blue',
      pending: 'yellow',
      in_progress: 'purple',
      fixed: 'green',
      closed: 'gray',
    }
    return colorMap[status] || 'gray'
  }

  const priorityColor = (priority) => {
    const colorMap = {
      low: 'blue',
      medium: 'yellow',
      high: 'orange',
      urgent: 'red',
    }
    return colorMap[priority] || 'gray'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Filters Layout Block */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Ticket Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'open', label: 'Open' },
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'fixed', label: 'Fixed' },
                { value: 'closed', label: 'Closed' },
              ]}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            />
            <Select
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            />
            <Select
              options={[
                { value: '', label: 'All Categories' },
                { value: 'it_equipment', label: 'IT Equipment' },
                { value: 'electrical', label: 'Electrical' },
                { value: 'plumbing', label: 'Plumbing' },
                { value: 'furniture', label: 'Furniture' },
                { value: 'structural', label: 'Structural' },
                { value: 'cleaning', label: 'Cleaning' },
                { value: 'hardware', label: 'Hardware' },
                { value: 'other', label: 'Other' }
              ]}
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </div>
        </Card>

        {/* Bulk Actions Interface Bar */}
        {selectedIds.size > 0 && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedIds.size} row selections marked
              </span>
              <div className="flex gap-2">
                <Select
                  options={[{ value: '', label: 'Assign to...' }, ...technicians.map((t) => ({ value: t.id, label: t.name }))]}
                  value={assignToId}
                  onChange={(e) => setAssignToId(e.target.value)}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={bulkAssign}
                  disabled={!assignToId}
                  variant="primary"
                >
                  <Users size={16} className="mr-1" />
                  Assign
                </Button>
                <Button
                  size="sm"
                  onClick={bulkClose}
                  variant="success"
                >
                  <CheckCircle size={16} className="mr-1" />
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={bulkDelete}
                  variant="danger"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tickets Core Table Layout */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === tickets.length && tickets.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Priority</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">SLA Window</th>
                  <th className="text-left py-3 px-4">Assigned Specialist</th>
                  <th className="text-center py-3 px-4 w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Syncing database matrix updates...
                    </td>
                  </tr>
                ) : tickets.length > 0 ? (
                  tickets.map((ticket) => {
                    const sla = calculateSLA(ticket.created_at, ticket.priority)
                    const slaText = sla.isOverdue
                      ? 'OVERDUE'
                      : `${Math.round(sla.hoursRemaining)}h`
                    return (
                      <tr
                        key={ticket.id}
                        className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          sla.isOverdue ? 'border-l-4 border-l-red-500' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(ticket.id)}
                            onChange={() => toggleSelect(ticket.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {ticket.title}
                        </td>
                        <td className="py-3 px-4 capitalize">
                          <Badge variant="default">{ticket.category?.replace('_', ' ')}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={priorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={sla.color}
                            className={sla.isOverdue ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700' : ''}
                          >
                            {slaText}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {ticket.assigned_to_name || '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openAssignModal(ticket)}
                            className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                            title="Assign technician"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No active tickets matching filter specifications.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Assignment Modal */}
      <Modal 
        isOpen={showAssignModal} 
        onClose={closeAssignModal} 
        title="Assign Task to Technician" 
        size="md"
        footer={
          <div className="flex gap-2 w-full">
            <Button
              onClick={assignToTechnician}
              disabled={!assignToId || assigningLoading}
              loading={assigningLoading}
              variant="primary"
              className="flex-1"
            >
              <Users size={16} className="mr-2" />
              Assign Task
            </Button>
            <Button
              onClick={closeAssignModal}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              <strong>Ticket:</strong>
            </p>
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {selectedTicket.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ID: #{selectedTicket.id}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Technician
          </label>
          <Select
            options={[
              { value: '', label: 'Choose a technician...' },
              ...technicians.map((t) => ({ value: t.id, label: t.name }))
            ]}
            value={assignToId}
            onChange={(e) => setAssignToId(e.target.value)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  )
}