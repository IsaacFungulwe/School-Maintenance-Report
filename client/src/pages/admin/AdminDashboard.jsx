import React, { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts'
import { Bell, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { DashboardLayout } from '../../layouts'
import axios from 'axios'
import toast from 'react-hot-toast'

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
)

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <AlertCircle size={48} className="text-gray-400 mb-3" />
    <p className="text-gray-600 dark:text-gray-400">{message}</p>
  </div>
)

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [statusData, setStatusData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [buildingData, setBuildingData] = useState([])
  const [workloadData, setWorkloadData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, statusRes, categoryRes, buildingRes, workloadRes, trendRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/stats/by-status'),
        axios.get('/api/admin/stats/by-category'),
        axios.get('/api/admin/stats/by-building'),
        axios.get('/api/admin/workload'),
        axios.get('/api/admin/stats/resolution-trend'),
      ])

      setStats(statsRes.data)
      setStatusData(statusRes.data)
      setCategoryData(categoryRes.data)
      setBuildingData(buildingRes.data)
      setWorkloadData(workloadRes.data)
      setTrendData(trendRes.data)
      setError(null)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const colors = ['#001F3F', '#003D7A', '#0066CC', '#3399FF', '#66CCFF']

  const colorStyles = {
    primary: '#001F3F',
    success: '#16a34a',
    warning: '#ea580c',
    danger: '#dc2626',
  }

  const KPICard = ({ icon: Icon, title, value, color = 'primary' }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-2 text-primary dark:text-blue-400" style={{ color: colorStyles[color] || colorStyles.primary }}>{value || 0}</p>
        </div>
        <Icon size={32} className="opacity-20" style={{ color: colorStyles[color] || colorStyles.primary }} />
      </div>
    </Card>
  )

  if (loading) return <DashboardLayout><SkeletonLoader /></DashboardLayout>
  if (error) return <DashboardLayout><EmptyState message={error} /></DashboardLayout>
  if (!stats) return <DashboardLayout><EmptyState message="No data available" /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <KPICard
            icon={AlertCircle}
            title="Total Open"
            value={stats.total_open}
            color="primary"
          />
          <KPICard
            icon={Clock}
            title="Unassigned"
            value={stats.unassigned}
            color="primary"
          />
          <KPICard
            icon={AlertCircle}
            title="Overdue"
            value={stats.overdue}
            color="primary"
          />
          <KPICard
            icon={Bell}
            title="Urgent"
            value={stats.urgent}
            color="primary"
          />
          <KPICard
            icon={CheckCircle}
            title="Resolved (Week)"
            value={stats.resolved_this_week}
            color="primary"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Donut */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              By Status
            </h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No status data" />
            )}
          </Card>

          {/* Category Bar */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              By Category
            </h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#001F3F" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No category data" />
            )}
          </Card>

          {/* Resolution Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resolution Trend
            </h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg_days" stroke="#001F3F" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No trend data" />
            )}
          </Card>
        </div>

        {/* Building Hotspots & Technician Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Building Hotspots Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Building Hotspots
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2">Building</th>
                    <th className="text-right py-2 px-2">Open</th>
                    <th className="text-right py-2 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {buildingData.length > 0 ? (
                    buildingData.map((row) => (
                      <tr key={row.building} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-2">{row.building}</td>
                        <td className="text-right py-3 px-2 font-semibold">{row.open_count}</td>
                        <td className="text-right py-3 px-2">{row.total_count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-6">
                        <EmptyState message="No building data" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Technician Workload Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Technician Workload
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2">Technician</th>
                    <th className="text-right py-2 px-2">Open Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {workloadData.length > 0 ? (
                    workloadData.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-2">{row.name}</td>
                        <td className="text-right py-3 px-2 font-semibold">{row.open_tasks || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-6">
                        <EmptyState message="No technician data" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
