import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import api, { setAuth } from '../lib/api'
import { useAuth } from '../context/AuthContext'

// Demo placeholders are for UI/testing only — do not use these as real credentials or commit real secrets.
export default function Login(){
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { setToken, setRole } = useAuth()
  const [activeTab, setActiveTab] = useState('customer') // 'customer' | 'vendor'
  const [identifier, setIdentifier] = useState('') // email or phone
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSignup, setShowSignup] = useState(false)

  // Initialize active tab based on query string role
  React.useEffect(()=>{
    try{
      const params = new URLSearchParams(location.search)
      const role = (params.get('role')||'').toLowerCase()
      if (role === 'vendor' || role === 'customer') setActiveTab(role)
    }catch{}
  },[location.search])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Backend expects email/password; baseURL already includes /api
      const { data } = await api.post('/auth/login', { email: identifier.trim(), password })
      // Handle response shape: { token, user } or legacy { token, role, name, email }
      const accessToken = data?.token || data?.access_token
      if (!accessToken) throw new Error('No token returned')

      // Persist token and set global auth header
      setAuth(accessToken)
      // Persist token in context (AuthProvider will mirror to localStorage mx_token)
      setToken(accessToken)

      // Determine role from login response or fallback to /auth/me
      let role = data?.user?.role || data?.role || null
      if(!role){
        const me = await api.get('/auth/me')
        role = me?.data?.role || 'customer'
      }
      setRole(role)
      // Persist role explicitly as requested
      try{ localStorage.setItem('role', role) }catch{}

      // Redirect based on role
      if (role === 'vendor') navigate('/vendor/home', { replace: true })
      else if (role === 'admin') navigate('/admin/dashboard', { replace: true })
      else navigate('/customer/home', { replace: true })
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        setError('Invalid credentials')
        setShowSignup(false)
      } else if (status === 422) {
        setError('Please enter a valid email')
        setShowSignup(false)
      } else if (status === 404) {
        setError('Account not found')
        setShowSignup(true)
      } else {
        setError('Network or server error')
        setShowSignup(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md backdrop-blur-md bg-white/30 shadow-2xl rounded-xl p-6 border border-white/40 vintage-card">
        <h2 className="text-3xl font-display text-charcoal mb-3">{t('login.title')}</h2>
        <p className="text-sm text-charcoal/80 mb-4">{t('login.subtitle')}</p>

        {/* Tabs: Customer / Barber */}
        <div className="mb-4 inline-flex rounded-full overflow-hidden border border-charcoal/15 bg-white/60">
          <button type="button" onClick={()=>setActiveTab('customer')} className={`px-4 py-2 text-sm ${activeTab==='customer'?'bg-gold/80 text-charcoal':'text-charcoal/80'}`}>Customer</button>
          <button type="button" onClick={()=>setActiveTab('vendor')} className={`px-4 py-2 text-sm ${activeTab==='vendor'?'bg-gold/80 text-charcoal':'text-charcoal/80'}`}>Barber</button>
        </div>

        {error && <div className="mb-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="you@example.com"
              required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('login.password')}</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('login.passwordPlaceholder')}
              required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary vintage-cta">{loading ? 'Signing in...' : (activeTab==='vendor' ? 'Login as Barber' : t('cta.getStarted'))}</button>
      </form>
    </motion.div>

      {/* Signup prompt modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowSignup(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5" onClick={e=>e.stopPropagation()}>
            <h3 className="font-display text-2xl text-charcoal mb-2">No account found</h3>
            <p className="text-sm text-charcoal/80 mb-4">Looks like you need to sign up. Create a {activeTab==='vendor'?'Barber':'Customer'} account?</p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 text-charcoal/80" onClick={()=>setShowSignup(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-md text-charcoal" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}
                onClick={()=>{ setShowSignup(false); navigate(`/register?role=${activeTab==='vendor'?'vendor':'customer'}`) }}>
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
