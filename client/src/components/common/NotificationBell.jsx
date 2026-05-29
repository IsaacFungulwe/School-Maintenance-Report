import React, { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const NotificationBell = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch notifications every 60 seconds
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unread_count || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (notificationId, ticketId) => {
    try {
      setLoading(true)
      await axios.patch(`/api/notifications/${notificationId}/mark-read`)
      await fetchNotifications()
      if (ticketId) {
        navigate(`/admin/tickets/${ticketId}`)
      }
      setShowDropdown(false)
    } catch (error) {
      toast.error('Failed to mark notification as read')
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      setLoading(true)
      await axios.patch('/api/notifications/mark-all-read')
      await fetchNotifications()
    } catch (error) {
      toast.error('Failed to mark all as read')
    } finally {
      setLoading(false)
    }
  }

  // Only show for admin users
  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notification Panel */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => markAsRead(notification.id, notification.related_ticket_id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {notification.subject}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="w-full py-2 px-4 text-sm font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
