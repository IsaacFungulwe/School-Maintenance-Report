import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { AuthLayout } from '../../layouts'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { Button } from '../../components/common/Button'
import { Alert } from '../../components/common/Alert'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
  })
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError('')
  }

  const handleRoleChange = (newRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      department: '',
    }))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validation
    if (!formData.name) {
      setFormError('Name is required')
      return
    }
    if (!formData.email) {
      setFormError('Email is required')
      return
    }
    if (!formData.password) {
      setFormError('Password is required')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }
    if (formData.role === 'staff' && !formData.department) {
      setFormError('Department is required for staff members')
      return
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }
      if (formData.role === 'staff') {
        payload.department = formData.department
      } else {
        payload.department = null
      }
      await register(payload)
      navigate('/dashboard')
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md px-6 py-12 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join our maintenance reporting system
          </p>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}
        {formError && <Alert type="error" message={formError} className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Student Card */}
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'student'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-xl mb-1">👨‍🎓</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Student
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  I am a student
                </div>
              </button>

              {/* Staff Card */}
              <button
                type="button"
                onClick={() => handleRoleChange('staff')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'staff'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-xl mb-1">👔</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Staff
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  I am a teacher, lecturer or department head
                </div>
              </button>
            </div>
          </div>

          {/* Department Field - Only show when Staff is selected */}
          {formData.role === 'staff' && (
            <Input
              label="Department"
              type="text"
              name="department"
              placeholder="e.g., Computer Science, Engineering"
              value={formData.department}
              onChange={handleChange}
              required
            />
          )}

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
