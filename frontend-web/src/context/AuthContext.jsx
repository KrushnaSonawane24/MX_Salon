import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import api, { setAuth } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  // Initialize from new keys, fallback to legacy keys
  const [token, setToken] = useState(()=> (typeof window!=='undefined'
    ? (localStorage.getItem('token') || localStorage.getItem('mx_token'))
    : null))
  const [role, setRole] = useState(()=> (typeof window!=='undefined'
    ? (localStorage.getItem('role') || localStorage.getItem('mx_role'))
    : null))
  const [user, setUser] = useState(()=> (typeof window!=='undefined'
    ? (JSON.parse(localStorage.getItem('user')||'null') || JSON.parse(localStorage.getItem('mx_user')||'null'))
    : null))

  useEffect(()=>{
    // Persist under new and legacy keys for compatibility
    if(token){ localStorage.setItem('token', token); localStorage.setItem('mx_token', token) }
    else { localStorage.removeItem('token'); localStorage.removeItem('mx_token') }
    // Keep axios header in sync
    setAuth(token || null)
  },[token])
  useEffect(()=>{
    if(role){ localStorage.setItem('role', role); localStorage.setItem('mx_role', role) }
    else { localStorage.removeItem('role'); localStorage.removeItem('mx_role') }
  },[role])
  useEffect(()=>{
    if(user){ localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('mx_user', JSON.stringify(user)) }
    else { localStorage.removeItem('user'); localStorage.removeItem('mx_user') }
  },[user])

  // Load current user when token changes
  useEffect(()=>{
    let cancelled = false
    async function load(){
      if(!token) { setUser(null); return }
      try{
        // baseURL already includes /api
        const { data } = await api.get('/auth/me')
        if(!cancelled){
          setUser(data)
          if(data?.role) setRole(data.role)
        }
      }catch(err){
        if(!cancelled){ setUser(null); setRole(null) }
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[token])

  function logout(){
    setToken(null); setRole(null); setUser(null)
    // Clear all auth-related keys
    if(typeof window !== 'undefined'){
      try { 
        localStorage.removeItem('token'); 
        localStorage.removeItem('role');
        localStorage.removeItem('mx_token');
        localStorage.removeItem('mx_role');
        localStorage.removeItem('mx_user');
      } catch {}
      // Redirect to first landing page then reload
      window.location.href = '/'
      setTimeout(()=>{ try{ window.location.reload() }catch{} }, 100)
    }
  }

  const isAuthenticated = !!token
  const value = useMemo(()=>({ token, setToken, role, setRole, user, setUser, isAuthenticated, logout }),[token, role, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  return useContext(AuthContext)
}
