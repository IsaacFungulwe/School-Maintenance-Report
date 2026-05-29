import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '../../layouts'
import { Card } from '../../components/common/Card'
import { Select } from '../../components/common/Select'
import { Badge } from '../../components/common/Badge'
import axios from 'axios'
import toast from 'react-hot-toast'

export const AuditLog = () => {
  const [auditLog, setAuditLog] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
  })
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
  })

  useEffect(() => {
    fetchAuditLog()
  }, [filters, pagination])

  const fetchAuditLog = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.user_id) params.append('user_id', filters.user_id)
      if (filters.action) params.append('action', filters.action)
      params.append('limit', pagination.limit)
      params.append('offset', pagination.offset)

      const res = await axios.get(`/api/audit/log?${params}`)
      setAuditLog(res.data.data)
      setTotal(res.data.total)
    } catch (error) {
      toast.error('Failed to load audit log')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const actionBadgeColor = (action) => {
    if (action.includes('create')) return 'green'
    if (action.includes('update')) return 'blue'
    if (action.includes('delete')) return 'red'
    return 'default'
  }

  const pageCount = Math.ceil(total / pagination.limit)
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Filters */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Audit Log Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="User"
              options={[{ value: '', label: 'All Users' }]}
              value={filters.user_id}
              onChange={(e) =>
                setFilters({ ...filters, user_id: e.target.value })
              }
            />
            <Select
              label="Action"
              options={[
                { value: '', label: 'All Actions' },
                { value: 'create', label: 'Create' },
                { value: 'update', label: 'Update' },
                { value: 'delete', label: 'Delete' },
              ]}
              value={filters.action}
              onChange={(e) =>
                setFilters({ ...filters, action: e.target.value })
              }
            />
          </div>
        </Card>

        {/* Audit Log Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">User ID</th>
                  <th className="text-left py-3 px-4">Action</th>
                  <th className="text-left py-3 px-4">Resource</th>
                  <th className="text-left py-3 px-4">IP Address</th>
                  <th className="text-left py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.length > 0 ? (
                  auditLog.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {log.user_id}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={actionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {log.resource_type}
                        {log.resource_id ? ` #${log.resource_id}` : ''}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                        {log.ip_address || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No audit log entries
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {pagination.offset + 1} to{' '}
                {Math.min(pagination.offset + pagination.limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      offset: Math.max(0, pagination.offset - pagination.limit),
                    })
                  }
                  disabled={pagination.offset === 0}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      offset: Math.min(
                        pagination.offset + pagination.limit,
                        (pageCount - 1) * pagination.limit
                      ),
                    })
                  }
                  disabled={currentPage === pageCount}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
