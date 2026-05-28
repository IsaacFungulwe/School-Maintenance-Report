import React, { useState } from 'react'
import { Upload, X } from 'lucide-react'

export const FileUpload = React.forwardRef(
  ({
    label,
    error,
    accept = 'image/*',
    multiple = false,
    onChange,
    className = '',
    containerClassName = '',
    maxSize = 5, // MB
    ...props
  }, ref) => {
    const [files, setFiles] = useState([])
    const [dragActive, setDragActive] = useState(false)

    const handleFiles = (fileList) => {
      const newFiles = Array.from(fileList).filter((file) => {
        const sizeMB = file.size / (1024 * 1024)
        if (sizeMB > maxSize) {
          alert(`File ${file.name} exceeds maximum size of ${maxSize}MB`)
          return false
        }
        return true
      })

      if (newFiles.length > 0) {
        const updated = multiple ? [...files, ...newFiles] : newFiles
        setFiles(updated)
        onChange?.(updated)
      }
    }

    const handleDrag = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    }

    const handleDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    }

    const removeFile = (index) => {
      const updated = files.filter((_, i) => i !== index)
      setFiles(updated)
      onChange?.(updated)
    }

    return (
      <div className={`flex flex-col ${containerClassName}`}>
        {label && (
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${error ? 'border-red-500' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={ref}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            {...props}
          />

          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drag files here or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum {maxSize}MB per file
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'
