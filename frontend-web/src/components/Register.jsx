import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import api, { setAuth } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const nav = useNavigate()
  const location = useLocation()
  const defaultRole = useMemo(()=>{
    const params = new URLSearchParams(location.search)
    const r = params.get('role')
    return (r==='vendor' || r==='customer') ? r : 'customer'
  },[location.search])
  const { setToken, setRole } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole, phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const pw = (form.password||'')
    const strongPw = pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw)
    if(!strongPw){ setError('Password must be at least 8 characters and include letters and numbers'); setLoading(false); return }
    try{
      const phoneNorm = (form.phone||'').replace(/[^\d+]/g, '')
      const payload = { ...form, phone: phoneNorm || undefined }
      // Register using corrected base path; baseURL already includes /api
      await api.post('/auth/register', payload)
      const { data } = await api.post('/auth/login', { email: form.email.trim(), password: form.password })
      const accessToken = data?.token || data?.access_token
      let role = data?.user?.role || data?.role || null
      if(!accessToken) throw new Error('No token returned after registration')
      if(!role){
        const me = await api.get('/auth/me')
        role = me?.data?.role || 'customer'
      }
      setAuth(accessToken)
      setToken(accessToken)
      setRole(role)
      try{ localStorage.setItem('role', role) }catch{}
      if (role === 'vendor') nav('/vendor/home', { replace: true })
      else if (role === 'admin') nav('/admin/dashboard', { replace: true })
      else nav('/customer/home', { replace: true })
    }catch(err){
      const msg = err?.response?.data?.error || 'Registration failed'
      setError(msg)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md backdrop-blur-md bg-white/30 shadow-2xl rounded-xl p-6 border border-white/40">
        <h2 className="text-3xl font-display text-charcoal mb-4">Create an account</h2>
        {error && <div className="mb-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input name="name" value={form.name} onChange={onChange} required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone (optional)</label>
            <input name="phone" placeholder="e.g. +919876543210 or 9876543210" value={form.phone} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select name="role" value={form.role} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal">
              <option value="customer">Customer</option>
              <option value="vendor">Barber</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary vintage-cta">{loading ? 'Creating...' : 'Create account'}</button>
        </form>
      </motion.div>
    </div>
  )
}
