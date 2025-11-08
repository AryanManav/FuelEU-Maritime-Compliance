import axios from 'axios'

const apiClient = axios.create({
  // default to backend port 4001 which the in-memory server runs on in this workspace
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4001'
})

export default apiClient
