import React, { useState } from 'react'
import api, { setAuth } from '../lib/api'
import { useTranslation } from 'react-i18next'

export default function Login({ onSuccess }){
  const { t } = useTranslation()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(){
    setLoading(true); setError('')
    try{
  const r = await api.post('/auth/login', { email, password })
      const token = r.data.access_token
      setAuth(token)
      onSuccess(token)
    }catch(e){ setError('Invalid credentials') }
    finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 card">
      <h1 className="text-xl font-semibold mb-4">{t('login')}</h1>
      <input className="w-full border p-2 mb-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
      <input className="w-full border p-2 mb-4" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/>
      <button className="btn w-full" onClick={submit} disabled={loading}>{loading? '...' : t('login')}</button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  )
}
