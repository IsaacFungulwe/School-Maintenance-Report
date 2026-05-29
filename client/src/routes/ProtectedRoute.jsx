import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/common/Loaders'

export const ProtectedRoute = ({
  element,
  requiredRoles = [],
  isPublic = false,
}) => {
  const { isAuthenticated, hasRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // Public routes
  if (isPublic) {
    return isAuthenticated ? <Navigate to="/dashboard" /> : element
  }

  // Protected routes - check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" />
  }

  return element
}
