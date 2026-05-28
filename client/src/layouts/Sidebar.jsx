import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Ticket,
  Users,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      active
        ? 'bg-primary text-white shadow-soft-md'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
    }`}
  >
    <Icon size={20} className={active ? '' : 'group-hover:text-primary'} />
    <span className="text-sm font-medium">{label}</span>
  </Link>
)

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/tickets', icon: Ticket, label: 'All Tickets' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/locations', icon: MapPin, label: 'Locations' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ]

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/tickets', icon: Ticket, label: 'My Tickets' },
  ]

  const technicianLinks = [
    { to: '/technician/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/technician/tickets', icon: Ticket, label: 'Assigned Work' },
  ]

  const getLinks = () => {
    if (hasRole('admin')) return adminLinks
    if (hasRole('technician')) return technicianLinks
    return studentLinks
  }

  const links = getLinks()

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden mb-4 w-full flex justify-center text-gray-600 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            {links.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                active={isActive(link.to)}
              />
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <SidebarLink
              to="/settings"
              icon={Settings}
              label="Settings"
              active={isActive('/settings')}
            />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
              to="/settings"
              icon={Settings}
              label="Settings"
              active={isActive('/settings')}
            />
          </div>
        </div>
      </aside>
    </>
  )
}
