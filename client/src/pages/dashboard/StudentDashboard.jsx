import React, { useState, useEffect } from 'react'
import { Plus, Ticket, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../layouts'
import { Card, CardHeader, CardBody } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { SkeletonLoader } from '../../components/common/Loaders'
import { ticketApi } from '../../api/ticketApi'
import { Badge, StatusBadge } from '../../components/common/Badge'
import toast from 'react-hot-toast'

const TicketCard = ({ ticket }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {ticket.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          #{ticket.id}
        </p>
      </div>
      <StatusBadge status={ticket.status} />
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      {ticket.description}
    </p>
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(ticket.created_at).toLocaleDateString()}
      </span>
      <Link to={`/student/tickets/${ticket.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    </div>
  </div>
)

export const StudentDashboard = () => {
  const [tickets, setTickets] = useState(null)
  const [stats, setStats] = useState({
    open: 0,
    pending: 0,
    resolved: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await ticketApi.getAll({ limit: 5 })
        setTickets(res.data)

        // Calculate stats from tickets
        const data = res.data
        setStats({
          open: data.filter((t) => t.status === 'open').length,
          pending: data.filter((t) => t.status === 'pending').length,
          resolved: data.filter((t) => t.status === 'resolved').length,
        })
      } catch (error) {
        toast.error('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Tickets
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and manage your maintenance requests
            </p>
          </div>
          <Link to="/student/tickets/create">
            <Button variant="primary" className="mt-4 sm:mt-0">
              <Plus size={18} className="mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Ticket size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Open Tickets
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.open}
                </p>
              </div>
            </div>
          </Card>

          <Card className="hover">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pending}
                </p>
              </div>
            </div>
          </Card>

          <Card className="hover">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.resolved}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tickets Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Tickets
          </h2>
          {loading ? (
            <SkeletonLoader count={3} height="h-24" className="mb-4" />
          ) : tickets && tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No tickets yet. Create one to get started!
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
