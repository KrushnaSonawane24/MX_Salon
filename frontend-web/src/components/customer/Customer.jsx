import React from 'react'
import { motion } from 'framer-motion'
import api, { setAuth } from '../../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { getSocket } from '../../lib/socket'

export default function Customer(){
  const navigate = useNavigate()
  const [salons, setSalons] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [usingNearby, setUsingNearby] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [form, setForm] = React.useState({ name: '', city: '', pincode: '' })
  const [queueCounts, setQueueCounts] = React.useState({})
  const [myBooking, setMyBooking] = React.useState(null)

  const updateQueueCounts = React.useCallback(async (list)=>{
    try{
      const entries = await Promise.all((list||[]).map(async (s)=>{
        try{
          const { data } = await api.get(`/queue/${s._id}`)
          const active = (data||[]).filter(it=> ['pending','accepted','checked-in'].includes(it.status))
          return [s._id, active.length]
        }catch{ return [s._id, 0] }
      }))
      const map = Object.fromEntries(entries)
      setQueueCounts(map)
    }catch{}
  },[])

  React.useEffect(()=>{
    let cancelled = false
    async function load(){
      setLoading(true); setError(''); setMessage('')
      // Try geolocation for nearby
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async (pos)=>{
          try{
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
      const { data } = await api.get('/salon/near', { params: { lat, lng, radiusKm: 10, counts: 1 } })
            if(!cancelled){ setSalons(data||[]); setUsingNearby(true); updateQueueCounts(data||[]) }
          }catch{
            try{
      const { data } = await api.get('/salon/all', { params: { counts: 1 } })
              if(!cancelled){ setSalons(data||[]); setUsingNearby(false); updateQueueCounts(data||[]) }
            }catch{ if(!cancelled){ setError('Failed to load salons') } }
          }finally{ if(!cancelled){ setLoading(false) } }
        }, async ()=>{
          try{
      const { data } = await api.get('/salon/all', { params: { counts: 1 } })
            if(!cancelled){ setSalons(data||[]); setUsingNearby(false); updateQueueCounts(data||[]) }
          }catch{ if(!cancelled){ setError('Failed to load salons') } }
          finally{ if(!cancelled){ setLoading(false) } }
        }, { enableHighAccuracy: true, timeout: 5000 })
      } else {
        try{
      const { data } = await api.get('/salon/all', { params: { counts: 1 } })
          if(!cancelled){ setSalons(data||[]); setUsingNearby(false); updateQueueCounts(data||[]) }
        }catch{ if(!cancelled){ setError('Failed to load salons') } }
        finally{ if(!cancelled){ setLoading(false) } }
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[updateQueueCounts])

  // Live queue counts via Socket.IO
  React.useEffect(()=>{
    const socket = getSocket()
    const handler = ()=> { updateQueueCounts(salons); loadMyBooking() }
    socket.on('queue:new', handler)
    socket.on('queue:update', handler)
    return ()=>{
      socket.off('queue:new', handler)
      socket.off('queue:update', handler)
    }
  },[salons, updateQueueCounts, loadMyBooking])

  // Load my current booking
  const loadMyBooking = React.useCallback(async ()=>{
    try{ const { data } = await api.get('/queue/mine/current'); setMyBooking(data) }catch{ setMyBooking(null) }
  },[])
  React.useEffect(()=>{ loadMyBooking() },[loadMyBooking])

  async function joinQueue(salonId){
    setMessage(''); setError('')
    const service = window.prompt('Enter service (e.g., Haircut, Beard, Facial):') || ''
    try{
    await api.post('/queue/join', { salonId, service })
      setMessage('Joined queue successfully')
      loadMyBooking()
      navigate(`/salon/${salonId}`)
    }catch(err){
      const errorMsg = err?.response?.data?.error || 'Failed to join queue. Please login as Customer and try again.'
      setError(errorMsg)
    }
  }

  async function cancelMyBooking(){
    const reason = window.prompt('Reason for cancellation (optional):') || ''
    try{ await api.post('/queue/cancel', { reason }); setMessage('Booking cancelled'); loadMyBooking(); updateQueueCounts(salons) }
    catch{ setError('Failed to cancel') }
  }

  async function onSearch(e){
    e.preventDefault(); setError(''); setLoading(true); setMessage('')
    try{
      const params = {}
      if(form.name) params.name = form.name
      if(form.city) params.city = form.city
      if(form.pincode) params.pincode = form.pincode
      const { data } = await api.get('/salon/search', { params: { ...params, counts: 1 } })
      // sort by top-rated
      const sorted = [...(data||[])].sort((a,b)=> (b?.ratingsSummary?.average||0) - (a?.ratingsSummary?.average||0))
      setSalons(sorted); setUsingNearby(false); updateQueueCounts(sorted)
    }catch{ setError('Search failed') }
    finally{ setLoading(false) }
  }

  async function loadNearby(){
    setError(''); setLoading(true); setMessage('')
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(async (pos)=>{
        try{
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
      const { data } = await api.get('/salon/near', { params: { lat, lng, radiusKm: 10 } })
          const sorted = [...(data||[])].sort((a,b)=> (b?.ratingsSummary?.average||0) - (a?.ratingsSummary?.average||0))
          setSalons(sorted); setUsingNearby(true); updateQueueCounts(sorted)
        }catch{ setError('Failed to load nearby') }
        finally{ setLoading(false) }
      }, ()=>{ setError('Location permission denied'); setLoading(false) }, { enableHighAccuracy: true, timeout: 5000 })
    } else { setError('Geolocation not available'); setLoading(false) }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-display text-3xl text-charcoal">{usingNearby ? 'Salons Near You' : 'Available Salons'}</h2>
          <p className="text-sm text-charcoal/70">{usingNearby ? 'Based on your location' : 'Showing all salons'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadNearby} className="text-sm px-3 py-1 rounded border border-charcoal/20 text-charcoal/80 hover:bg-white/40">Nearby</button>
          {message && <div className="text-sm text-green-800">{message}</div>}
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={onSearch} className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} placeholder="Salon name" className="px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
        <input value={form.city} onChange={e=>setForm(f=>({...f, city: e.target.value}))} placeholder="City" className="px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
        <input value={form.pincode} onChange={e=>setForm(f=>({...f, pincode: e.target.value}))} placeholder="Pincode" className="px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal text-charcoal" />
        <button type="submit" className="px-3 py-2 rounded text-charcoal" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}>Search</button>
      </form>

      {/* My Booking */}
      {myBooking && (
        <div className="mb-6 card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-charcoal">My Booking</h3>
            <div className="flex gap-2">
              {myBooking.salonId?._id && (
                <Link to={`/salon/${myBooking.salonId._id}`} className="text-sm px-3 py-1 rounded border border-charcoal/20 text-charcoal/90 hover:bg-white/50">View Salon</Link>
              )}
              <button onClick={cancelMyBooking} className="text-sm px-3 py-1 rounded border border-red-500/50 text-red-700 hover:bg-red-50">Cancel</button>
            </div>
          </div>
          <div className="text-sm text-charcoal/80 mt-2">Salon: {myBooking.salonId?.name || myBooking.salonId || '—'} • Status: {myBooking.status} • Position: {myBooking.position ?? '—'}</div>
        </div>
      )}

      {loading && <div className="text-charcoal/80">Loading...</div>}
      {error && <div className="text-red-700">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {salons.map((s, idx)=> (
            <motion.div key={s._id || idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.03*idx }} className="card hover:lift">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg text-charcoal">
                    <Link to={`/salon/${s._id}`} className="hover:underline">
                      {s.name}
                    </Link>
                  </div>
                  <div className="text-sm text-charcoal/70">{(s.services||[]).join(', ')}</div>
                  {s.location?.address && <div className="text-xs text-charcoal/60 mt-1">{s.location.address}</div>}
                </div>
                <div className="text-right">
                  {typeof s.distanceKm === 'number' && (
                    <div className="text-xs text-charcoal/70">{s.distanceKm.toFixed(1)} km</div>
                  )}
                  <span className="mt-1 inline-block text-xs bg-green-600 text-white px-2 py-0.5 rounded">~{s.ratingsSummary?.count || 0} fb</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-charcoal/80">Rating: {(s.ratingsSummary?.average||0).toFixed(1)} ★</div>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded border border-charcoal/15 bg-white/60 text-charcoal/80">In queue: { (typeof s.queueCountActive === 'number' ? s.queueCountActive : (queueCounts[s._id] ?? 0)) }</span>
                  <Link to={`/salon/${s._id}`} className="text-sm px-3 py-1 rounded border border-charcoal/20 text-charcoal/90 hover:bg-white/50">View</Link>
                  <button onClick={()=>joinQueue(s._id)} className="text-sm px-3 py-1 rounded" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)', color: '#2b2b2b' }}>Join Queue</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
