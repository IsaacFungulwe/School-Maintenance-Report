import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../layouts'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../components/common/Table'
import { StatusBadge } from '../../components/common/Badge'
import { SkeletonLoader } from '../../components/common/Loaders'
import { ticketApi } from '../../api/ticketApi'
import { EmptyState } from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

export const TicketListPage = () => {
  const [tickets, setTickets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const res = await ticketApi.getAll({
          search: searchTerm,
          status: statusFilter,
          page: currentPage,
          limit: itemsPerPage,
        })
        setTickets(res.data)
      } catch (error) {
        toast.error('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchTickets()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, statusFilter, currentPage])

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tickets
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage all maintenance tickets
            </p>
          </div>
          <Link to="/student/tickets/create">
            <Button variant="primary" className="mt-4 sm:mt-0">
              <Plus size={18} className="mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            icon={<Search size={18} />}
          />
          <Select
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
          />
          <Button variant="secondary" className="w-full">
            <Download size={18} className="mr-2" />
            Export
          </Button>
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <SkeletonLoader count={5} height="h-12" className="mb-3" />
          ) : tickets && tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>ID</TableCell>
                    <TableCell header>Title</TableCell>
                    <TableCell header>Location</TableCell>
                    <TableCell header>Status</TableCell>
                    <TableCell header>Created</TableCell>
                    <TableCell header>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>#{ticket.id}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>{ticket.location || 'N/A'}</TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/student/tickets/${ticket.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="No tickets found"
              description="Create a new ticket to get started"
              action={
                <Link to="/student/tickets/create">
                  <Button variant="primary">Create Ticket</Button>
                </Link>
              }
              className="py-12"
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
