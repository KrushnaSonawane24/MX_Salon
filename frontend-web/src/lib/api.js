import axios from 'axios'

// Fixed axios baseURL
const baseURL = 'http://localhost:5001/api'

// Disable credentials to avoid CORS failures with wildcard origins; we use Bearer tokens
const api = axios.create({ baseURL, withCredentials: false })

// Attach Bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || localStorage.getItem('mx_token'))
      : null
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Helper to set/remove Authorization header and persist token consistently
export function setAuth(token){
  if(token){
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    try{
      if(typeof window !== 'undefined'){
        localStorage.setItem('token', token)
        localStorage.setItem('mx_token', token) // backward compatibility
      }
    }catch{}
  }else{
    delete api.defaults.headers.common.Authorization
    try{
      if(typeof window !== 'undefined'){
        localStorage.removeItem('token')
        localStorage.removeItem('mx_token')
      }
    }catch{}
  }
}

export default api
