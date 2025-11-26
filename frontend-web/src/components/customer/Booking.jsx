import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api, { setAuth } from '../../lib/api'

function useQuery(){
  const { search } = useLocation()
  return React.useMemo(()=> new URLSearchParams(search), [search])
}

// Calculate distance using Haversine formula (approximate)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function Booking(){
  const q = useQuery()
  const presetService = q.get('service') || ''
  const [service, setService] = React.useState(presetService)
  const [stylist, setStylist] = React.useState('')
  const [startTime, setStartTime] = React.useState('')
  const [searchType, setSearchType] = React.useState('name') // 'name' | 'area'
  const [salonName, setSalonName] = React.useState('')
  const [searchArea, setSearchArea] = React.useState('')
  const [searchPincode, setSearchPincode] = React.useState('')
  const [salonOptions, setSalonOptions] = React.useState([])
  const [salonId, setSalonId] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const [userLocation, setUserLocation] = React.useState(null)
  const navigate = useNavigate()

  // Get user's current location for distance calculation
  React.useEffect(()=>{
    if('geolocation' in navigator){
      navigator.geolocation.getCurrentPosition(
        (position)=>{
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        ()=>{ /* Silent fail */ }
      )
    }
  },[])

  async function searchSalons(){
    try{
      let params = {}
      if(searchType === 'name' && salonName){
        params = { name: salonName }
      } else if(searchType === 'area'){
        if(searchArea) params.area = searchArea
        if(searchPincode) params.pincode = searchPincode
      }
      if(Object.keys(params).length === 0) {
        // If no search params, get all salons
    const { data } = await api.get('/salons')
        setSalonOptions(data||[])
        return
      }
    const { data } = await api.get('/salon/search', { params })
      let salons = data||[]
      
      // Calculate distances if user location is available
      if(userLocation && salons.length > 0){
        salons = salons.map(salon => {
          if(salon.location?.lat && salon.location?.lng){
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              salon.location.lat,
              salon.location.lng
            )
            return { ...salon, distance: distance.toFixed(1) }
          }
          return salon
        }).sort((a, b) => (a.distance || 999) - (b.distance || 999))
      }
      
      setSalonOptions(salons)
    }catch{ setSalonOptions([]) }
  }

  async function submit(e){
    e.preventDefault(); setSaving(true); setError(''); setMsg('')
    try{
      if(!salonId) { setError('Please select a salon'); setSaving(false); return }
      const payload = { salonId, service, stylist, startTime }
    await api.post('/appointments', payload)
      setMsg('Your appointment is confirmed!')
      setTimeout(()=> navigate('/customer-dashboard'), 1200)
    }catch(err){
      const errorMsg = err?.response?.data?.error || 'Failed to create appointment'
      setError(errorMsg)
    }
    finally{ setSaving(false) }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
          <h2 className="font-display text-3xl text-charcoal mb-4">Book an appointment</h2>
          {msg && <div className="text-sm text-green-800 mb-2">{msg}</div>}
          {error && <div className="text-sm text-red-700 mb-2">{error}</div>}
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Service</label>
              <select value={service} onChange={e=>setService(e.target.value)} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal" required>
                <option value="">Select a service</option>
                <option value="Haircut">Haircut</option>
                <option value="Beard">Beard</option>
                <option value="Facial">Facial</option>
                <option value="Haircut + Beard">Haircut + Beard</option>
                <option value="Haircut + Facial">Haircut + Facial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Preferred stylist (optional)</label>
              <input value={stylist} onChange={e=>setStylist(e.target.value)} placeholder="e.g., Raj" className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Date & Time</label>
              <input type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Search by</label>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={()=>setSearchType('name')} className={`px-3 py-1 rounded text-sm ${searchType==='name'?'bg-gold/80':'border border-charcoal/20'}`}>Salon Name</button>
                <button type="button" onClick={()=>setSearchType('area')} className={`px-3 py-1 rounded text-sm ${searchType==='area'?'bg-gold/80':'border border-charcoal/20'}`}>Area / Pincode</button>
              </div>
              {searchType === 'name' ? (
                <div className="flex gap-2">
                  <input value={salonName} onChange={e=>setSalonName(e.target.value)} placeholder="Type salon name" className="flex-1 px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal" />
                  <button type="button" onClick={searchSalons} className="px-3 py-2 rounded border border-charcoal/20 text-charcoal/90 hover:bg-white/60">Search</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  <input value={searchArea} onChange={e=>setSearchArea(e.target.value)} placeholder="Area / City" className="px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal" />
                  <div className="flex gap-2">
                    <input value={searchPincode} onChange={e=>setSearchPincode(e.target.value)} placeholder="Pincode" className="flex-1 px-3 py-2 rounded border border-charcoal/20 bg-white/80 text-charcoal" />
                    <button type="button" onClick={searchSalons} className="px-3 py-2 rounded border border-charcoal/20 text-charcoal/90 hover:bg-white/60">Search</button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </motion.div>

        {/* Salon List */}
        {salonOptions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display text-2xl text-charcoal mb-3">Available Salons</h3>
            {salonOptions.map(salon => (
              <motion.div 
                key={salon._id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`card cursor-pointer transition-all ${salonId === salon._id ? 'ring-2 ring-gold' : 'hover:shadow-lg'}`}
                onClick={()=>setSalonId(salon._id)}
              >
                <div className="grid md:grid-cols-4 gap-4">
                  {salon.photos && salon.photos.length > 0 && (
                    <div className="md:col-span-1">
                      <img src={salon.photos[0]} alt={salon.name} className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  )}
                  <div className={salon.photos && salon.photos.length > 0 ? "md:col-span-3" : "md:col-span-4"}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg text-charcoal">{salon.name}</h4>
                        <div className="text-sm text-charcoal/70">{salon.location?.address}</div>
                        {salon.location?.pincode && <div className="text-xs text-charcoal/60">Pincode: {salon.location.pincode}</div>}
                      </div>
                      {salon.distance && (
                        <div className="text-sm text-charcoal/80 font-medium">{salon.distance} km away</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-charcoal/80 mb-2">
                      {salon.contactNo && (
                        <div className="flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {salon.contactNo}
                        </div>
                      )}
                      {salon.timings && (
                        <div className="text-xs text-charcoal/60">
                          {salon.timings.open} - {salon.timings.close}
                        </div>
                      )}
                    </div>
                    {salon.services && salon.services.length > 0 && (
                      <div className="text-xs text-charcoal/70">Services: {salon.services.join(', ')}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {salonId && (
          <div className="mt-6 flex justify-end">
            <button disabled={saving} onClick={submit} className="px-6 py-3 rounded text-charcoal font-medium" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}>
              {saving ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
