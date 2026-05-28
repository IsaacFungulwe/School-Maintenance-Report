import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Ticket,
  Users,
  MapPin,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
        : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
    }`}
  >
    <Icon size={20} />
    <span className="hidden lg:inline">{label}</span>
  </Link>
)

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

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
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden mb-4 w-full flex justify-center"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Navigation Links */}
          <nav className="space-y-2">
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

          {/* Settings Link */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <SidebarLink
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
