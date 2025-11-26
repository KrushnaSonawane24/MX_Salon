import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

function roleHomePath(role){
  if(role === 'admin') return '/admin/dashboard'
  if(role === 'vendor') return '/vendor/home'
  return '/customer/home'
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { token, user, setUser } = useAuth()
  const location = useLocation()
  const [checking, setChecking] = useState(!!token && !user)
  const [authorized, setAuthorized] = useState(!!user)

  useEffect(()=>{
    let cancelled = false
    async function verify(){
      if(!token){ setAuthorized(false); setChecking(false); return }
      if(user){ setAuthorized(true); setChecking(false); return }
      try{
        const { data } = await api.get('/auth/me')
        if(cancelled) return
        setUser?.(data)
        setAuthorized(true)
      }catch(err){
        if(cancelled) return
        // Only redirect on 401 per requirement
        if(err?.response?.status === 401){ setAuthorized(false) }
      }finally{
        if(!cancelled) setChecking(false)
      }
    }
    verify()
    return ()=>{ cancelled = true }
  },[token, user, setUser])

  // Redirect to login if token missing
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Show loader while verifying token/user
  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-charcoal">Loading...</div>
  }

  // Redirect to login if token invalid (401)
  if (!authorized) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Enforce role-based access if specified
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />
  }

  return children
}

// Component to redirect logged-in users away from auth pages
export function PublicRoute({ children }) {
  const { token, user } = useAuth()
  if (token && user) {
    return <Navigate to={roleHomePath(user.role)} replace />
  }
  return children
}
