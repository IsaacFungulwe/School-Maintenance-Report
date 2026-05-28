import React, { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit } from 'lucide-react'
import { DashboardLayout } from '../../layouts'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { Modal } from '../../components/common/Modal'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../components/common/Table'
import { Badge } from '../../components/common/Badge'
import { SkeletonLoader } from '../../components/common/Loaders'
import { userApi } from '../../api/userApi'
import { EmptyState } from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

export const UsersManagementPage = () => {
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await userApi.getAll({ search: searchTerm })
        setUsers(res.data)
      } catch (error) {
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchUsers()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await userApi.create(formData)
      toast.success('User created successfully')
      setShowAddModal(false)
      setFormData({ name: '', email: '', role: 'student' })
      // Refresh list
      const res = await userApi.getAll({ search: searchTerm })
      setUsers(res.data)
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await userApi.updateRole(userId, newRole)
      toast.success('User role updated')
      const res = await userApi.getAll({ search: searchTerm })
      setUsers(res.data)
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  const handleDeactivateUser = async (userId) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return

    try {
      await userApi.deactivate(userId)
      toast.success('User deactivated')
      const res = await userApi.getAll({ search: searchTerm })
      setUsers(res.data)
    } catch (error) {
      toast.error('Failed to deactivate user')
    }
  }

  const roleColors = {
    admin: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200',
    technician: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200',
    student: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200',
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Users Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage user accounts and permissions
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus size={18} className="mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <SkeletonLoader count={5} height="h-12" className="mb-3" />
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>Name</TableCell>
                    <TableCell header>Email</TableCell>
                    <TableCell header>Role</TableCell>
                    <TableCell header>Status</TableCell>
                    <TableCell header>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateRole(user.id, e.target.value)
                          }
                          options={[
                            { value: 'student', label: 'Student' },
                            { value: 'technician', label: 'Technician' },
                            { value: 'admin', label: 'Admin' },
                          ]}
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.active ? 'green' : 'default'}
                          className={roleColors[user.role]}
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            handleDeactivateUser(user.id)
                          }
                          className="text-red-600 dark:text-red-400 hover:underline text-sm"
                        >
                          Deactivate
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="No users found"
              description="Start by adding a new user"
              action={
                <Button
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add User
                </Button>
              }
              className="py-12"
            />
          )}
        </Card>

        {/* Add User Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setFormData({ name: '', email: '', role: 'student' })
          }}
          title="Add New User"
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddUser}>
                Create User
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="John Doe"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="john@example.com"
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              options={[
                { value: 'student', label: 'Student' },
                { value: 'technician', label: 'Technician' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
