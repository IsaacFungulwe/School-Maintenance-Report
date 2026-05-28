import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../layouts'
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { FileUpload } from '../../components/common/FileUpload'
import { Alert } from '../../components/common/Alert'
import { ticketApi } from '../../api/ticketApi'
import { locationApi } from '../../api/locationApi'
import toast from 'react-hot-toast'

export const CreateTicketPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location_id: '',
    priority: 'normal',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title) {
      setError('Title is required')
      return
    }
    if (!formData.description) {
      setError('Description is required')
      return
    }
    if (!formData.location_id) {
      setError('Location is required')
      return
    }

    try {
      setLoading(true)
      const res = await ticketApi.create(formData)
      toast.success('Ticket created successfully')
      navigate(`/student/tickets/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Create New Ticket
          </h1>

          <Card>
            <CardBody>
              {error && <Alert type="error" message={error} className="mb-6" />}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Ticket Title"
                  name="title"
                  placeholder="e.g., Broken water fountain in Building A"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please describe the issue in detail..."
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <Select
                  label="Location"
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  options={[
                    { value: '1', label: 'Building A - Room 101' },
                    { value: '2', label: 'Building B - Lobby' },
                    { value: '3', label: 'Building C - Cafeteria' },
                  ]}
                  required
                />

                <Select
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />

                <FileUpload
                  label="Attachments (Optional)"
                  accept="image/*,.pdf"
                  multiple={true}
                  maxSize={10}
                  onChange={setFiles}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="flex-1"
                  >
                    Create Ticket
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/student/tickets')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
