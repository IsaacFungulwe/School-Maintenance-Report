import React, { useState, useEffect } from 'react'
import { BarChart3, Ticket, Users, MapPin } from 'lucide-react'
import { DashboardLayout } from '../../layouts'
import { Card, CardHeader, CardBody } from '../../components/common/Card'
import { SkeletonLoader } from '../../components/common/Loaders'
import { ticketApi } from '../../api/ticketApi'
import { userApi } from '../../api/userApi'
import toast from 'react-hot-toast'

const StatCard = ({ icon: Icon, label, value, loading, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  }

  return (
    <Card className="hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            {label}
          </p>
          {loading ? (
            <SkeletonLoader height="h-8" className="w-12" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  )
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, usersRes] = await Promise.all([
          ticketApi.getStats(),
          userApi.getAll({ limit: 5 }),
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data)
      } catch (error) {
        toast.error('Failed to load dashboard data')
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's your maintenance system overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Ticket}
            label="Total Tickets"
            value={stats?.total || 0}
            loading={loading}
            color="primary"
          />
          <StatCard
            icon={Ticket}
            label="Open Tickets"
            value={stats?.open || 0}
            loading={loading}
            color="orange"
          />
          <StatCard
            icon={Ticket}
            label="Resolved Tickets"
            value={stats?.resolved || 0}
            loading={loading}
            color="green"
          />
          <StatCard
            icon={Users}
            label="Active Users"
            value={stats?.active_users || 0}
            loading={loading}
            color="red"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Tickets
                </h2>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <SkeletonLoader count={3} />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Ticket list will be displayed here
                  </p>
                )}
              </CardBody>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Stats
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {loading ? (
                  <SkeletonLoader count={3} />
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Avg Response Time
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        2.5h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Completion Rate
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        94%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Overdue Tickets
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        3
                      </span>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
