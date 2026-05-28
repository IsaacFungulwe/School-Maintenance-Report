import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../layouts'
import { Card, CardHeader, CardBody } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { SkeletonLoader } from '../../components/common/Loaders'
import { ticketApi } from '../../api/ticketApi'
import { StatusBadge } from '../../components/common/Badge'
import toast from 'react-hot-toast'

const WorkCard = ({ ticket }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {ticket.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Location: {ticket.location || 'N/A'}
        </p>
      </div>
      <StatusBadge status={ticket.status} />
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      {ticket.description}
    </p>
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Assigned: {new Date(ticket.assigned_at).toLocaleDateString()}
      </span>
      <Link to={`/technician/tickets/${ticket.id}`}>
        <Button variant="ghost" size="sm">
          Work On It
        </Button>
      </Link>
    </div>
  </div>
)

export const TechnicianDashboard = () => {
  const [tickets, setTickets] = useState(null)
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await ticketApi.getAll({ status: 'assigned', limit: 10 })
        setTickets(res.data)

        const data = res.data
        setStats({
          assigned: data.filter((t) => t.status === 'open').length,
          inProgress: data.filter((t) => t.status === 'in_progress').length,
          completed: data.filter((t) => t.status === 'resolved').length,
        })
      } catch (error) {
        toast.error('Failed to load assigned tickets')
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Assigned Work
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and complete your assigned maintenance tasks
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <Card className="hover">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Assigned
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.assigned}
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
                  In Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.inProgress}
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
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completed}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Work Items */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Work Queue
          </h2>
          {loading ? (
            <SkeletonLoader count={3} height="h-24" className="mb-4" />
          ) : tickets && tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((ticket) => (
                <WorkCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No assigned tickets. Great job!
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
