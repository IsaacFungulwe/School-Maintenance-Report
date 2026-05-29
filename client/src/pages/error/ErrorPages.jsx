import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '../../components/common/Button'

export const NotFoundPage = () => (
  <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-900 to-gray-800 px-4">
    <AlertCircle size={48} className="text-gray-400" />
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-xl text-gray-400 mb-6">Page not found</p>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
    </div>
    <Link to="/">
      <Button variant="primary">Go Home</Button>
    </Link>
  </div>
)

export const UnauthorizedPage = () => (
  <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-900 to-gray-800 px-4">
    <AlertCircle size={48} className="text-red-400" />
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-2">403</h1>
      <p className="text-xl text-gray-400 mb-6">Access Denied</p>
      <p className="text-gray-500 mb-8 max-w-sm">
        You don&apos;t have permission to access this resource.
      </p>
    </div>
    <Link to="/dashboard">
      <Button variant="primary">Go to Dashboard</Button>
    </Link>
  </div>
)
