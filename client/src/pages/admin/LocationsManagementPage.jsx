import React, { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { DashboardLayout } from '../../layouts'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../components/common/Table'
import { SkeletonLoader } from '../../components/common/Loaders'
import { locationApi } from '../../api/locationApi'
import { EmptyState } from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

export const LocationsManagementPage = () => {
  const [locations, setLocations] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: '',
  })

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const res = await locationApi.getAll()
        setLocations(res.data)
      } catch (error) {
        toast.error('Failed to load locations')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const handleAddLocation = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Location name is required')
      return
    }

    try {
      await locationApi.create(formData)
      toast.success('Location created successfully')
      setShowAddModal(false)
      setFormData({ name: '', building: '', floor: '' })
      const res = await locationApi.getAll()
      setLocations(res.data)
    } catch (error) {
      toast.error('Failed to create location')
    }
  }

  const handleDeleteLocation = async (id) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return

    try {
      await locationApi.delete(id)
      toast.success('Location deleted')
      const res = await locationApi.getAll()
      setLocations(res.data)
    } catch (error) {
      toast.error('Failed to delete location')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Locations Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage maintenance locations
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus size={18} className="mr-2" />
            Add Location
          </Button>
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <SkeletonLoader count={5} height="h-12" className="mb-3" />
          ) : locations && locations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>Name</TableCell>
                    <TableCell header>Building</TableCell>
                    <TableCell header>Floor</TableCell>
                    <TableCell header>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>{location.name}</TableCell>
                      <TableCell>{location.building || 'N/A'}</TableCell>
                      <TableCell>{location.floor || 'N/A'}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="No locations found"
              description="Create a new location to get started"
              action={
                <Button
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Location
                </Button>
              }
              className="py-12"
            />
          )}
        </Card>

        {/* Add Location Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setFormData({ name: '', building: '', floor: '' })
          }}
          title="Add New Location"
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddLocation}>
                Create Location
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Location Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Building A - Room 101"
            />
            <Input
              label="Building"
              value={formData.building}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, building: e.target.value }))
              }
              placeholder="e.g., Building A"
            />
            <Input
              label="Floor"
              value={formData.floor}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, floor: e.target.value }))
              }
              placeholder="e.g., 1st Floor"
            />
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
