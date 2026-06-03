import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'
import axios from 'axios'

// 1. Point this explicitly to your backend Express server with the /api prefix
axios.defaults.baseURL = 'http://127.0.0.1:5000/api'

// 2. Global Interceptor to automatically attach your token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)