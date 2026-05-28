import React from 'react'

export const Table = ({ children, className = '' }) => (
  <div className="overflow-x-auto">
    <table className={`w-full text-sm ${className}`}>{children}</table>
  </div>
)

export const TableHead = ({ children }) => (
  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
    {children}
  </thead>
)

export const TableRow = ({ children, className = '' }) => (
  <tr className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${className}`}>
    {children}
  </tr>
)

export const TableCell = ({ children, header = false, className = '' }) => {
  const baseClass = 'px-6 py-4 text-gray-900 dark:text-gray-100'
  if (header) {
    return <th className={`${baseClass} text-left font-semibold text-gray-700 dark:text-gray-300 ${className}`}>{children}</th>
  }
  return <td className={`${baseClass} ${className}`}>{children}</td>
}

export const TableBody = ({ children }) => (
  <tbody>{children}</tbody>
)
