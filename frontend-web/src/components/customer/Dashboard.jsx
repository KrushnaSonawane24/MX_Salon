import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api, { setAuth } from '../../lib/api'

const CANCELLATION_REASONS = [
  'Too far',
  'Changed plan',
  'Unsatisfied service',
  'Found another salon',
  'Emergency',
  'Other'
]

export default function Dashboard(){
  const [data, setData] = React.useState(null)
  const [appointments, setAppointments] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [cancellingId, setCancellingId] = React.useState(null)
  const [cancelReason, setCancelReason] = React.useState('')
  const [showCancelModal, setShowCancelModal] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(()=>{
    let cancelled = false
    async function load(){
      setLoading(true); setError('')
      try{
        const [dashboardRes, appointmentsRes] = await Promise.all([
          api.get('/user/dashboard'),
          api.get('/appointments/mine').catch(()=>({data:[]}))
        ])
        if(!cancelled) {
          setData(dashboardRes.data)
          setAppointments(appointmentsRes.data || [])
        }
        if(dashboardRes.data?.user && !dashboardRes.data.user.rememberPreference){
          navigate('/onboarding')
          return
        }
      }catch{ if(!cancelled) setError('Failed to load dashboard') }
      finally{ if(!cancelled) setLoading(false) }
    }
    load()
    return ()=>{ cancelled = true }
  },[navigate])

  function quickBook(){
    if(!data?.quickBookService){
      navigate('/book')
    } else {
      navigate(`/book?service=${encodeURIComponent(data.quickBookService)}`)
    }
  }

  function openCancelModal(appointmentId){
    setCancellingId(appointmentId)
    setCancelReason('')
    setShowCancelModal(true)
  }

  async function handleCancel(){
    if(!cancelReason || !cancellingId) return
    try{
      await api.patch(`/appointments/${cancellingId}/cancel`, { reason: cancelReason })
      setAppointments(prev => prev.map(apt => 
        apt._id === cancellingId ? { ...apt, status: 'cancelled', cancellationReason: cancelReason } : apt
      ))
      setShowCancelModal(false)
      setCancellingId(null)
      setCancelReason('')
      // Reload dashboard
      const { data } = await api.get('/user/dashboard')
      setData(data)
    }catch(err){
      setError(err?.response?.data?.error || 'Failed to cancel appointment')
    }
  }

  if(loading) return <div className="container mx-auto px-4 py-12 text-charcoal/80">Loading...</div>
  if(error) return <div className="container mx-auto px-4 py-12 text-red-700">{error}</div>

  const name = data?.user?.name || 'Friend'
  const msg = data?.daysSinceLastBooking != null
    ? `Hey ${name}, your last ${data?.user?.preferredService || 'visit'} was ${data.daysSinceLastBooking} day(s) ago.`
    : `Welcome back, ${name}! Ready for your fresh haircut?`

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.startTime) > new Date()
  ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h3 className="font-display text-2xl text-charcoal mb-2">Next Appointment</h3>
          {data?.nextAppointment ? (
            <div className="text-charcoal/80 text-sm">
              <div>Service: <b>{data.nextAppointment.service}</b></div>
              <div>When: {new Date(data.nextAppointment.startTime).toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-charcoal/60 text-sm">No upcoming appointments.</div>
          )}
        </div>
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="font-display text-2xl text-charcoal mb-2">Quick Book</h3>
            <p className="text-charcoal/70 text-sm mb-3">{msg}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={quickBook} className="px-4 py-2 rounded text-charcoal" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}>
              {data?.quickBookService ? `Book ${data.quickBookService}` : 'Book a service'}
            </button>
          </div>
        </div>
        <div className="card">
          <h3 className="font-display text-2xl text-charcoal mb-2">Recommended</h3>
          <div className="text-charcoal/60 text-sm">Offers and recommendations coming soon.</div>
        </div>
      </div>

      {/* Appointments List */}
      {upcomingAppointments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 className="font-display text-2xl text-charcoal mb-4">My Appointments</h3>
          <div className="space-y-3">
            {upcomingAppointments.map(apt => (
              <div key={apt._id} className="border border-charcoal/10 rounded-lg p-4 bg-white/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-charcoal mb-1">{apt.service}</div>
                    <div className="text-sm text-charcoal/70 mb-1">
                      {apt.salonId?.name || 'Salon'} • {new Date(apt.startTime).toLocaleString()}
                    </div>
                    {apt.stylist && <div className="text-xs text-charcoal/60">Stylist: {apt.stylist}</div>}
                  </div>
                  <button 
                    onClick={()=>openCancelModal(apt._id)}
                    className="px-3 py-1 text-sm rounded border border-red-500/50 text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={()=>setShowCancelModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" 
            onClick={e=>e.stopPropagation()}
          >
            <h3 className="font-display text-2xl text-charcoal mb-4">Cancel Appointment</h3>
            <div className="mb-4">
              <label className="block text-sm mb-2 text-charcoal/80">Reason for cancellation</label>
              <select 
                value={cancelReason} 
                onChange={e=>setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 text-charcoal"
              >
                <option value="">Select a reason</option>
                {CANCELLATION_REASONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={()=>setShowCancelModal(false)}
                className="px-4 py-2 rounded border border-charcoal/20 text-charcoal/80 hover:bg-charcoal/10"
              >
                Keep Appointment
              </button>
              <button 
                onClick={handleCancel}
                disabled={!cancelReason}
                className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancellation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
