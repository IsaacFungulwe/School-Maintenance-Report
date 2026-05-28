import React from 'react'

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200',
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const StatusBadge = ({ status }) => {
  const statusMap = {
    open: 'blue',
    'in_progress': 'orange',
    'in progress': 'orange',
    resolved: 'green',
    rejected: 'red',
    pending: 'yellow',
  }

  const variant = statusMap[status?.toLowerCase()] || 'default'

  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  )
}
