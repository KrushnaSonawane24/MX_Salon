import React from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api, { setAuth } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { getSocket } from '../../lib/socket'

function LiveQueueStatus({ salon, queue, user, onCancel }) {
  const myBooking = user ? queue.find(q => q.userId?._id === user._id) : null;
  const checkedIn = queue.find(q => q.status === 'checked-in');
  const pending = queue.filter(q => ['pending', 'accepted'].includes(q.status));
  const nowServing = checkedIn || pending[0];
  const peopleAhead = myBooking && nowServing ? myBooking.position - nowServing.position : 0;
  const estimatedWaitTime = peopleAhead > 0 ? peopleAhead * (salon.avgServiceTimeMinutes || 15) : 0;

  return (
    <div className="card bg-ivory-dark p-6 rounded-lg shadow-lg">
      <h3 className="font-display text-3xl text-charcoal mb-4">Live Queue Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
        <div className="p-3 bg-white/50 rounded-lg">
          <div className="text-charcoal/70 text-sm">Current Number</div>
          <div className="font-bold text-2xl text-charcoal">{nowServing ? `#${nowServing.position}` : 'N/A'}</div>
        </div>
        <div className={`p-3 rounded-lg ${myBooking ? 'bg-gold/30' : 'bg-white/50'}`}>
          <div className="text-charcoal/70 text-sm">Your Number</div>
          <div className="font-bold text-2xl text-charcoal">{myBooking ? `#${myBooking.position}` : 'N/A'}</div>
        </div>
        <div className="p-3 bg-white/50 rounded-lg">
          <div className="text-charcoal/70 text-sm">People Ahead</div>
          <div className="font-bold text-2xl text-charcoal">{peopleAhead > 0 ? peopleAhead : 0}</div>
        </div>
        <div className="p-3 bg-white/50 rounded-lg">
          <div className="text-charcoal/70 text-sm">Est. Wait Time</div>
          <div className="font-bold text-2xl text-charcoal">{estimatedWaitTime > 0 ? `~${estimatedWaitTime}m` : '-'}</div>
        </div>
      </div>

      {myBooking && (
        <div className="my-4 p-4 rounded-lg border border-gold/50 bg-gold/10 text-charcoal">
          <h4 className="font-bold">Your Booking Details</h4>
          <p>Service: {myBooking.service}</p>
          <p>Status: <span className="font-semibold">{myBooking.status}</span></p>
          <button
            onClick={() => onCancel(myBooking._id)}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Cancel Booking
          </button>
        </div>
      )}

      <div>
        <h4 className="font-display text-xl text-charcoal mb-2">Queue Table</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-charcoal">
            <thead className="text-xs text-charcoal/80 uppercase bg-white/30">
              <tr>
                <th scope="col" className="px-4 py-2">Position</th>
                <th scope="col" className="px-4 py-2">Status</th>
                <th scope="col" className="px-4 py-2">Service</th>
              </tr>
            </thead>
            <tbody>
              {queue.slice(0, 10).map((q) => (
                <tr key={q._id} className={`border-b border-charcoal/10 ${myBooking && myBooking._id === q._id ? 'bg-gold/20' : ''}`}>
                  <td className="px-4 py-3 font-bold">{`#${q.position}`}</td>
                  <td className="px-4 py-3">{q.status}</td>
                  <td className="px-4 py-3">{q.service || 'Not specified'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


export default function SalonDetail(){
  const { id } = useParams()
  const { user } = useAuth()
  const [salon, setSalon] = React.useState(null)
  const [queue, setQueue] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const [fb, setFb] = React.useState({ customerName: '', rating: 5, message: '' })

  const loadData = React.useCallback(async () => {
    let cancelled = false;
    setLoading(true); setError(''); setMsg('');
    try {
      const [s, q] = await Promise.all([
        api.get(`/salon/${id}`),
        api.get(`/queue/${id}`)
      ]);
      if (!cancelled) {
        setSalon(s.data);
        setQueue(q.data || []);
      }
    } catch (err) {
      if (!cancelled) setError('Failed to load salon details.');
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => { cancelled = true; };
  }, [id]);

  React.useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  // periodic queue refresh
  const refreshQueue = React.useCallback(async ()=>{
    try{
      const { data } = await api.get(`/queue/${id}`)
      setQueue(data||[])
    }catch{/* silent */}
  },[id])

  React.useEffect(()=>{
    const t = setInterval(refreshQueue, 12000)
    return ()=> clearInterval(t)
  },[refreshQueue])

  // Live updates via Socket.IO for this salon
  React.useEffect(()=>{
    const socket = getSocket()
    const onNew = (payload)=>{ if(payload?.salonId === id) refreshQueue() }
    const onUpdate = ()=>{ refreshQueue() }
    socket.on('queue:new', onNew)
    socket.on('queue:update', onUpdate)
    return ()=>{
      socket.off('queue:new', onNew)
      socket.off('queue:update', onUpdate)
    }
  },[id, refreshQueue])

  // Notifications helpers
  const requestNotif = React.useCallback(()=>{
    if('Notification' in window && Notification.permission === 'default'){
      Notification.requestPermission()
    }
  },[])

  const notify = React.useCallback((title, body)=>{
    if('Notification' in window && Notification.permission === 'granted'){
      new Notification(title, { body })
    }
  },[])

  // Notify customer when their turn is near or now
  const [lastNotified, setLastNotified] = React.useState({ next: false, now: false })
  
  React.useEffect(()=>{
    if(!user) return
    requestNotif()
    const my = queue.find(q=> q.userId?._id === user._id)
    if(!my) {
      setLastNotified({ next: false, now: false })
      return
    }
    const pendings = queue.filter(q=> q.status==='pending' || q.status==='accepted')
    const checkedIn = queue.find(q=> q.status==='checked-in')
    const now = checkedIn || pendings[0]
    const next = checkedIn ? pendings[0] : pendings[1]
    
    // Check if next in line
    if(next && next._id === my._id && !lastNotified.next){
      notify('Your turn is coming soon', 'Please reach the salon. You are next in line.')
      setLastNotified(prev => ({ ...prev, next: true }))
    }
    
    // Check if it's their turn now
    if(now && now._id === my._id && !lastNotified.now){
      notify("It's your turn now", 'Please proceed. The barber is ready for you.')
      setLastNotified(prev => ({ ...prev, now: true }))
    }
    
    // Reset notifications if position changes
    if(my && now && now._id !== my._id && next && next._id !== my._id){
      setLastNotified({ next: false, now: false })
    }
  },[queue, user, notify, requestNotif, lastNotified])

  async function handleCancelBooking(bookingId) {
    if (!window.confirm("Are you sure you want to cancel your booking?")) return;
    try {
      await api.post('/queue/cancel', { id: bookingId });
      setMsg("Your booking has been cancelled.");
      refreshQueue(); // Refresh the queue to show the change
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to cancel booking.');
    }
  }

  async function submitFeedback(e){
    e.preventDefault(); setMsg(''); setError('')
    try{
      await api.post(`/salon/${id}/feedback`, { customerName: fb.customerName, rating: Number(fb.rating), message: fb.message })
      setMsg('Thanks for your feedback!')
      setFb({ customerName: '', rating: 5, message: '' })
      // reload salon to refresh ratings/feedback count (lightweight)
      const { data } = await api.get(`/salon/${id}`)
      setSalon(data)
    }catch{ setError('Failed to submit feedback') }
  }

  if(loading) return <div className="container mx-auto px-4 py-12 text-charcoal/80">Loading...</div>
  if(error) return <div className="container mx-auto px-4 py-12 text-red-700">{error}</div>
  if(!salon) return <div className="container mx-auto px-4 py-12 text-charcoal/80">Not found</div>

  const gmapsUrl = salon.location?.lat && salon.location?.lng
    ? `https://www.google.com/maps/search/?api=1&query=${salon.location.lat},${salon.location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.location?.address || salon.name)}`;


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h2 className="font-display text-4xl text-charcoal">{salon.name}</h2>
          <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-charcoal/70 hover:text-gold transition-colors">
            {salon.location?.address} {salon.location?.pincode ? `(${salon.location.pincode})` : ''}
          </a>
          {salon.contactNo && <div className="text-sm text-charcoal/70">{salon.contactNo}</div>}
        </div>
        <div className="text-right mt-4 md:mt-0">
          <div className="text-sm text-charcoal/80">Rating: {(salon.ratingsSummary?.average||0).toFixed(1)} ★</div>
          <div className="text-xs text-charcoal/60">{salon.ratingsSummary?.count||0} feedbacks</div>
        </div>
      </div>

      {/* Live Queue Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <LiveQueueStatus salon={salon} queue={queue} user={user} onCancel={handleCancelBooking} />
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Salon Photos */}
        {(salon.photos?.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="card">
            <h3 className="font-display text-2xl text-charcoal mb-3">Salon Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {salon.photos.map((src, idx) => (
                <img key={idx} src={src} alt={`Salon ${idx + 1}`} className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" onClick={()=>window.open(src, '_blank')} />
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="card">
          <h3 className="font-display text-2xl text-charcoal mb-3">Services</h3>
          <div className="text-charcoal/80">{(salon.services||[]).length ? salon.services.join(', ') : 'No services listed yet.'}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="card">
          <h3 className="font-display text-2xl text-charcoal mb-3">Leave feedback</h3>
          {msg && <div className="text-sm text-green-800 mb-2">{msg}</div>}
          {error && <div className="text-sm text-red-700 mb-2">{error}</div>}
          <form onSubmit={submitFeedback} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Your name</label>
              <input value={fb.customerName} onChange={e=>setFb(f=>({...f, customerName: e.target.value}))} required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Rating (1-5)</label>
              <input type="number" min="1" max="5" value={fb.rating} onChange={e=>setFb(f=>({...f, rating: e.target.value}))} required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Message (optional)</label>
              <textarea value={fb.message} onChange={e=>setFb(f=>({...f, message: e.target.value}))} rows={3} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 rounded text-charcoal" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}>Submit</button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
