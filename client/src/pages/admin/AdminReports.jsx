import React, { useState, useEffect } from 'react'
import { Download, Calendar } from 'lucide-react'
import { DashboardLayout } from '../../layouts'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { Button } from '../../components/common/Button'
import axios from 'axios'
import toast from 'react-hot-toast'

export const AdminReports = () => {
  const [summary, setSummary] = useState(null)
  const [technicianData, setTechnicianData] = useState([])
  const [recurringData, setRecurringData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    category: '',
    building: '',
  })

  useEffect(() => {
    fetchReports()
  }, [filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.category) params.append('category', filters.category)
      if (filters.building) params.append('building', filters.building)

      const [summaryRes, techRes, recurringRes] = await Promise.all([
        axios.get(`/api/reports/summary?${params}`),
        axios.get(`/api/reports/by-technician?${params}`),
        axios.get(`/api/reports/recurring`),
      ])

      setSummary(summaryRes.data)
      setTechnicianData(techRes.data)
      setRecurringData(recurringRes.data)
    } catch (error) {
      toast.error('Failed to load reports')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.category) params.append('category', filters.category)
      if (filters.building) params.append('building', filters.building)

      const res = await axios.get(`/api/reports/export?${params}`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `tickets-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report exported')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Filters */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Report Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <Select
              label="Category"
              options={[
                { value: '', label: 'All Categories' },
                { value: 'electrical', label: 'Electrical' },
                { value: 'plumbing', label: 'Plumbing' },
                { value: 'hvac', label: 'HVAC' },
              ]}
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
            <Select
              label="Building"
              options={[
                { value: '', label: 'All Buildings' },
                { value: 'Admin Block', label: 'Admin Block' },
                { value: 'ICE Block', label: 'ICE Block' },
                { value: 'Main Hall', label: 'Main Hall' },
              ]}
              value={filters.building}
              onChange={(e) => setFilters({ ...filters, building: e.target.value })}
            />
            <div className="flex items-end">
              <Button
                onClick={exportCSV}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary */}
        {summary && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/10">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
                <p className="text-2xl font-bold text-primary">
                  {summary.total || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.resolved || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Resolution
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.avg_resolution_days || 0}d
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.urgent_count || 0}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Technician Performance */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Technician Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">Technician</th>
                  <th className="text-right py-3 px-4">Assigned</th>
                  <th className="text-right py-3 px-4">Resolved</th>
                  <th className="text-right py-3 px-4">Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {technicianData.length > 0 ? (
                  technicianData.map((tech) => (
                    <tr
                      key={tech.id}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {tech.name}
                      </td>
                      <td className="text-right py-3 px-4">
                        {tech.total_assigned}
                      </td>
                      <td className="text-right py-3 px-4">{tech.resolved}</td>
                      <td className="text-right py-3 px-4 text-green-600 font-semibold">
                        {tech.resolution_rate || 0}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No technician data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recurring Issues */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Recurring Issues by Category
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-right py-3 px-4">Count</th>
                  <th className="text-right py-3 px-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {recurringData.length > 0 ? (
                  recurringData.map((row) => (
                    <tr
                      key={row.category}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {row.category}
                      </td>
                      <td className="text-right py-3 px-4">{row.count}</td>
                      <td className="text-right py-3 px-4 text-primary font-semibold">
                        {row.percentage}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      No category data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
