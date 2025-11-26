import React from 'react'
import { useNavigate } from 'react-router-dom'
import api, { setAuth } from '../../lib/api'

export default function Onboarding(){
  const [form, setForm] = React.useState({ gender: '', preferredService: '', preferredStylist: '', rememberPreference: true })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault(); setSaving(true); setError('')
    try{
    await api.post('/user/preferences', form)
      navigate('/dashboard')
    }catch{ setError('Failed to save preferences') }
    finally{ setSaving(false) }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto card">
        <h2 className="font-display text-3xl text-charcoal mb-4">Welcome to MX.Salon</h2>
        <p className="text-charcoal/70 mb-4">Tell us a bit about your preferences. You can change these anytime.</p>
        {error && <div className="text-red-700 text-sm mb-2">{error}</div>}
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Gender</label>
            <select value={form.gender} onChange={e=>setForm(f=>({...f, gender: e.target.value}))} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Preferred Service</label>
            <input value={form.preferredService} onChange={e=>setForm(f=>({...f, preferredService: e.target.value}))} placeholder="Haircut, Beard, Facial" className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Preferred Stylist (optional)</label>
            <input value={form.preferredStylist} onChange={e=>setForm(f=>({...f, preferredStylist: e.target.value}))} placeholder="e.g., Raj" className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input id="rememberPreference" type="checkbox" checked={form.rememberPreference} onChange={e=>setForm(f=>({...f, rememberPreference: e.target.checked}))} />
            <label htmlFor="rememberPreference" className="text-sm text-charcoal/80">Remember my preference for future bookings</label>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button disabled={saving} type="submit" className="px-4 py-2 rounded text-charcoal" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}>{saving ? 'Saving...' : 'Continue'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
