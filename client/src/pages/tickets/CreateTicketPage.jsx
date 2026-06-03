import React, { useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { DashboardLayout } from '../../layouts'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { ticketApi } from '../../api/ticketApi'
import toast from 'react-hot-toast'

export const CreateTicketPage = () => {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hardware', 
    priority: 'low'
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please attach a valid image file (PNG, JPG, JPEG)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB maximum limit')
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill out all required fields')
      return
    }

    setLoading(true)

    try {
      let payload;

      // DYNAMIC PAYLOAD CHECK: Only use FormData if a file is present
      if (selectedFile) {
        const data = new FormData()
        data.append('title', formData.title.trim())
        data.append('description', formData.description.trim())
        data.append('category', formData.category)
        data.append('priority', formData.priority)
        data.append('image', selectedFile) 
        payload = data;
      } else {
        // Fallback to regular clean JSON payload if no image is attached
        payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          priority: formData.priority
        };
      }

      await ticketApi.create(payload)
      toast.success('Maintenance ticket submitted successfully!')
      
      setFormData({ title: '', description: '', category: 'hardware', priority: 'low' })
      removeImage()
    } catch (error) {
      // Look at precise response messages from backend validation libraries like Zod or Joi
      const serverMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to submit ticket parameters'
      toast.error(serverMessage)
      console.log("Validation details:", error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report an Issue</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Submit a new maintenance ticket with optional photo evidence.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Ticket Title"
              placeholder="e.g., Broken projector in Lab 3, Network switch failure"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { value: 'hardware', label: 'Hardware / Equipment' },
                  { value: 'software', label: 'Software / OS' },
                  { value: 'network', label: 'Network / Infrastructure' }
                ]}
              />

              <Select
                label="Priority Level"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: 'low', label: 'Low - General Maintenance' },
                  { value: 'medium', label: 'Medium - Normal Processing' },
                  { value: 'high', label: 'High - Critical Operational Block' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Detailed Description
              </label>
              <textarea
                className="w-full min-h-[120px] p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 shadow-sm"
                placeholder="Please describe the problem clearly..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* PHOTO ATTACHMENT BOX */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Attach Photo Evidence (Optional)
              </label>
              
              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      Click to upload system screenshot or camera photo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, or JPEG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="relative w-full max-h-64 rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 flex justify-center items-center p-2">
                  <img
                    src={previewUrl}
                    alt="Uploaded Evidence Preview"
                    className="object-contain max-h-60 rounded-md shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 font-medium shadow-md"
              >
                {loading ? 'Submitting Report...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default CreateTicketPage