import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Providers
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Components
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Spinner } from './components/common/Loaders'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardRedirect } from './pages/dashboard/DashboardRedirect'
import { StudentDashboard } from './pages/dashboard/StudentDashboard'
import { TechnicianDashboard } from './pages/dashboard/TechnicianDashboard'
import { TicketListPage } from './pages/tickets/TicketListPage'
import { CreateTicketPage } from './pages/tickets/CreateTicketPage'
import { TicketDetailsPage } from './pages/tickets/TicketDetailsPage'
import { UsersManagementPage } from './pages/admin/UsersManagementPage'
import { LocationsManagementPage } from './pages/admin/LocationsManagementPage'
import { SettingsPage } from './pages/admin/SettingsPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminTickets } from './pages/admin/AdminTickets'
import { AdminReports } from './pages/admin/AdminReports'
import { AuditLog } from './pages/admin/AuditLog'
import { NotFoundPage, UnauthorizedPage } from './pages/error/ErrorPages'

// Loading component
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <Spinner size="lg" />
  </div>
)

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Auth Routes */}
              <Route
                path="/login"
                element={
                  <ProtectedRoute element={<LoginPage />} isPublic={true} />
                }
              />
              <Route
                path="/register"
                element={
                  <ProtectedRoute element={<RegisterPage />} isPublic={true} />
                }
              />

              {/* Dashboard Redirect */}
              <Route
                path="/"
                element={<ProtectedRoute element={<DashboardRedirect />} />}
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<DashboardRedirect />} />}
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute
                    element={<AdminDashboard />}
                    requiredRoles={['admin']}
                  />
                }
              />
              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute
                    element={<AdminTickets />}
                    requiredRoles={['admin']}
                  />
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute
                    element={<AdminReports />}
                    requiredRoles={['admin']}
                  />
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute
                    element={<AuditLog />}
                    requiredRoles={['admin']}
                  />
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute
                    element={<UsersManagementPage />}
                    requiredRoles={['admin']}
                  />
                }
              />
              <Route
                path="/admin/locations"
                element={
                  <ProtectedRoute
                    element={<LocationsManagementPage />}
                    requiredRoles={['admin']}
                  />
                }
              />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute
                    element={<StudentDashboard />}
                    requiredRoles={['student']}
                  />
                }
              />
              <Route
                path="/student/tickets"
                element={
                  <ProtectedRoute
                    element={<TicketListPage />}
                    requiredRoles={['student']}
                  />
                }
              />
              <Route
                path="/student/tickets/create"
                element={
                  <ProtectedRoute
                    element={<CreateTicketPage />}
                    requiredRoles={['student']}
                  />
                }
              />
              <Route
                path="/student/tickets/:id"
                element={
                  <ProtectedRoute
                    element={<TicketDetailsPage />}
                    requiredRoles={['student']}
                  />
                }
              />

              {/* Technician Routes */}
              <Route
                path="/technician/dashboard"
                element={
                  <ProtectedRoute
                    element={<TechnicianDashboard />}
                    requiredRoles={['technician']}
                  />
                }
              />
              <Route
                path="/technician/tickets"
                element={
                  <ProtectedRoute
                    element={<TicketListPage />}
                    requiredRoles={['technician']}
                  />
                }
              />
              <Route
                path="/technician/tickets/:id"
                element={
                  <ProtectedRoute
                    element={<TicketDetailsPage />}
                    requiredRoles={['technician']}
                  />
                }
              />

              {/* Settings Routes */}
              <Route
                path="/settings"
                element={<ProtectedRoute element={<SettingsPage />} />}
              />

              {/* Error Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

