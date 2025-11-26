import React from 'react'
import { motion } from 'framer-motion'
import api, { setAuth } from '../../lib/api'
import { getSocket } from '../../lib/socket'
import AddressAutocomplete from './AddressAutocomplete'

export default function Vendor(){
  const [salon, setSalon] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [editMode, setEditMode] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '', businessEmail: '', contactNo: '', city: '',
    location: { address: '', pincode: '' },
    experienceYears: '', staffCount: '', chairsCount: '', services: '', photosUrls: ''
  })
  const [hint, setHint] = React.useState('')

  React.useEffect(()=>{
    let cancelled = false
    async function load(){
      setLoading(true); setError(''); setHint('')
      try{
    const { data } = await api.get('/salon/mine/current')
        if(!cancelled) setSalon(data)
      }catch{ if(!cancelled) setError('Failed to load salon') }
      finally{ if(!cancelled) setLoading(false) }
    }
    load()
    return ()=>{ cancelled = true }
  },[])

  function onChange(e){
    const { name, value } = e.target
    if(name.startsWith('location.')){
      const key = name.split('.')[1]
      setForm(f=> ({ ...f, location: { ...f.location, [key]: value } }))
    } else if(name==='services'){
      setForm(f=> ({ ...f, services: value }))
    } else {
      setForm(f=> ({ ...f, [name]: value }))
    }
  }

  function locationIsExact(){
    return !!form.location.address
  }

  async function createSalon(e){
    e.preventDefault(); setError(''); setHint('')
    if(!locationIsExact()){
      setHint('Address seems incomplete. Please provide the full address.')
      return
    }
    try{
      const payload = {
        name: form.name,
        businessEmail: form.businessEmail,
        contactNo: form.contactNo,
        city: form.city,
        experienceYears: Number(form.experienceYears||0),
        staffCount: Number(form.staffCount||0),
        chairsCount: Number(form.chairsCount||0),
        services: form.services ? form.services.split(',').map(s=>s.trim()).filter(Boolean) : [],
        photos: form.photosUrls ? form.photosUrls.split(',').map(u=>u.trim()).filter(Boolean) : [],
        location: {
          address: form.location.address,
          pincode: form.location.pincode,
        }
      }
    const { data } = await api.post('/salon', payload)
      setSalon(data); setHint('Salon created successfully')
    }catch(err){ setError('Failed to create salon. Ensure all fields are valid and you are logged in as Barber.') }
  }

  async function updateSalonProfile(e){
    e.preventDefault(); setError(''); setHint('')
    if(!locationIsExact()){
      setHint('Address seems incomplete. Please provide the full address.')
      return
    }
    try{
      const payload = {
        name: form.name,
        businessEmail: form.businessEmail,
        contactNo: form.contactNo,
        city: form.city,
        experienceYears: Number(form.experienceYears||0),
        staffCount: Number(form.staffCount||0),
        chairsCount: Number(form.chairsCount||0),
        services: form.services ? form.services.split(',').map(s=>s.trim()).filter(Boolean) : [],
        photos: form.photosUrls ? form.photosUrls.split(',').map(u=>u.trim()).filter(Boolean) : [],
        location: {
          address: form.location.address,
          pincode: form.location.pincode,
        }
      }
      const { data } = await api.put(`/salon/${salon._id}`, payload)
      setSalon(data); setHint('Profile updated'); setEditMode(false)
    }catch(err){ setError('Update failed') }
  }

  if(loading) return <div className="container mx-auto px-4 py-12 text-charcoal/80">Loading...</div>
  if(error) return <div className="container mx-auto px-4 py-12 text-red-700">{error}</div>

  if(salon){
    const startEdit = ()=>{
      setForm({
        name: salon.name || '',
        businessEmail: salon.businessEmail || '',
        contactNo: salon.contactNo || '',
        city: salon.city || '',
        experienceYears: salon.experienceYears || '',
        staffCount: salon.staffCount || '',
        chairsCount: salon.chairsCount || '',
        services: (salon.services||[]).join(', '),
        photosUrls: (salon.photos||[]).join(', '),
        location: {
          address: salon.location?.address || '',
          pincode: salon.location?.pincode || '',
        }
      })
      setEditMode(true)
    }
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl text-charcoal mb-2">Your Salon</h2>
            {!editMode && (
              <button onClick={startEdit} className="text-sm px-3 py-1 rounded border border-charcoal/20 text-charcoal/90 hover:bg-white/50">Edit Profile</button>
            )}
          </div>
          {hint && <div className="text-sm text-green-800 mb-2">{hint}</div>}
          {!editMode ? (
          <div className="grid sm:grid-cols-2 gap-4 text-charcoal/90">
            <div><span className="font-semibold">Name:</span> {salon.name}</div>
            <div><span className="font-semibold">Business Email:</span> {salon.businessEmail || '-'}</div>
            <div><span className="font-semibold">Contact No:</span> {salon.contactNo || '-'}</div>
            <div><span className="font-semibold">City:</span> {salon.city || '-'}</div>
            <div><span className="font-semibold">Address:</span> {salon.location?.address || '-'}</div>
            <div><span className="font-semibold">Pincode:</span> {salon.location?.pincode || '-'}</div>
            <div><span className="font-semibold">Experience (yrs):</span> {salon.experienceYears || 0}</div>
            <div><span className="font-semibold">Staff:</span> {salon.staffCount || 0}</div>
            <div><span className="font-semibold">Chairs:</span> {salon.chairsCount || 0}</div>
          </div>
          ) : (
          <form onSubmit={updateSalonProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm mb-1">Salon Name</label>
              <input name="name" value={form.name} onChange={onChange} required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Business Email</label>
              <input name="businessEmail" type="email" value={form.businessEmail} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Contact No</label>
              <input name="contactNo" value={form.contactNo} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">City</label>
              <input name="city" value={form.city} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Exact Address</label>
              <AddressAutocomplete
                defaultValue={form.location.address}
                onAddressSelect={(data)=>{
                  setForm(f=> ({
                    ...f,
                    city: data.city || f.city,
                    location: { ...f.location, address: data.address, pincode: data.pincode || f.location.pincode }
                  }))
                }}
              />
              <input name="location.address" value={form.location.address} onChange={onChange} placeholder="If autocomplete not loaded, type here" className="mt-2 w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Pincode</label>
              <input name="location.pincode" value={form.location.pincode} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Experience (years)</label>
              <input name="experienceYears" value={form.experienceYears} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Staff Count</label>
              <input name="staffCount" value={form.staffCount} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Chairs Count</label>
              <input name="chairsCount" value={form.chairsCount} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Services (comma separated)</label>
              <input name="services" value={form.services} onChange={onChange} placeholder="Haircut, Shave, Beard Styling" className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Photos (URLs, comma separated)</label>
              <input name="photosUrls" value={form.photosUrls} onChange={onChange} placeholder="https://...jpg, https://...png" className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-end gap-2">
              <button type="button" onClick={()=>setEditMode(false)} className="px-3 py-1 rounded border border-charcoal/20 text-charcoal/80 hover:bg-white/50">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded text-charcoal" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}>Save Changes</button>
            </div>
          </form>
          )}
          {(salon.photos?.length>0) && (
            <div className="mt-4">
              <h4 className="font-semibold text-charcoal mb-2">Photos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {salon.photos.map((src,idx)=> (
                  <img key={idx} src={src} alt="Salon" className="w-full h-24 object-cover rounded" />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Queue Dashboard */}
        <VendorQueue salonId={salon._id} />
      </div>
    )
  }

  // No salon yet: show create form
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card">
        <h2 className="font-display text-3xl text-charcoal mb-4">Create Your Salon</h2>
        {hint && <div className="text-sm text-amber-800 mb-3">{hint}</div>}
        {error && <div className="text-sm text-red-700 mb-3">{error}</div>}
        <form onSubmit={createSalon} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Salon Name</label>
            <input name="name" value={form.name} onChange={onChange} required className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Business Email</label>
            <input name="businessEmail" type="email" value={form.businessEmail} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Contact No</label>
            <input name="contactNo" value={form.contactNo} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">City</label>
            <input name="city" value={form.city} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Google Maps Address</label>
            <AddressAutocomplete
              defaultValue={form.location.address}
              onAddressSelect={(data)=>{
                setForm(f=> ({
                  ...f,
                  city: data.city || f.city,
                  location: { ...f.location, address: data.address, pincode: data.pincode || f.location.pincode }
                }))
              }}
            />
            <input name="location.address" value={form.location.address} onChange={onChange} placeholder="If autocomplete not loaded, type full address here" className="mt-2 w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Pincode</label>
            <input name="location.pincode" value={form.location.pincode} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Experience (years)</label>
            <input name="experienceYears" value={form.experienceYears} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Staff Count</label>
            <input name="staffCount" value={form.staffCount} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Chairs Count</label>
            <input name="chairsCount" value={form.chairsCount} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Services (comma separated)</label>
            <input name="services" value={form.services} onChange={onChange} placeholder="Haircut, Shave, Beard Styling" className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Photos (URLs, comma separated)</label>
            <input name="photosUrls" value={form.photosUrls} onChange={onChange} placeholder="https://...jpg, https://...png" className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
          </div>
          {!locationIsExact() && (
            <div className="sm:col-span-2 text-sm text-amber-800">Please provide the full address of your salon.</div>
          )}
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="px-4 py-2 rounded text-charcoal" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}>Create Salon</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function VendorQueue({ salonId }){
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const load = React.useCallback(async ()=>{
    try{
      setLoading(true); setError('')
      const { data } = await api.get(`/queue/${salonId}`)
      setItems(data||[])
    }catch{ setError('Failed to load queue') }
    finally{ setLoading(false) }
  },[salonId])

  React.useEffect(()=>{ load(); const t = setInterval(load, 10000); return ()=>clearInterval(t) },[load])

  // Live updates via Socket.IO
  React.useEffect(()=>{
    const socket = getSocket()
    const onNew = (payload)=>{ if(payload?.salonId === salonId) load() }
    const onUpdate = ()=>{ load() }
    socket.on('queue:new', onNew)
    socket.on('queue:update', onUpdate)
    return ()=>{
      socket.off('queue:new', onNew)
      socket.off('queue:update', onUpdate)
    }
  },[salonId, load])

  async function update(id, status){
    try{
      await api.patch(`/queue/${id}/status`, { status })
      load()
    }catch{ setError('Failed to update') }
  }

  const stats = React.useMemo(()=>{
    const today = new Date().toDateString()
    const todayItems = items.filter(i=> {
      const itemDate = i.joinTime ? new Date(i.joinTime).toDateString() : ''
      return itemDate === today
    })
    const activeStatuses = ['pending','accepted','checked-in']
    const active = todayItems.filter(i=> activeStatuses.includes(i.status)).length
    const checkedIn = todayItems.filter(i=> i.status==='checked-in').length
    return {
      totalToday: todayItems.length,
      active,
      checkedIn,
      completed: todayItems.filter(i=>i.status==='completed').length,
      cancelled: todayItems.filter(i=>i.status==='declined' || i.status==='cancelled').length,
      declined: todayItems.filter(i=>i.status==='declined').length
    }
  },[items])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="card mt-6">
      {/* Statistics */}
      <div className="mb-4 grid sm:grid-cols-5 gap-3">
        <div className="rounded-md p-3 border border-charcoal/15 bg-white/60">
          <div className="text-xs text-charcoal/60">Total Today</div>
          <div className="font-semibold text-charcoal text-lg">{stats.totalToday}</div>
        </div>
        <div className="rounded-md p-3 border border-charcoal/15 bg-white/60">
          <div className="text-xs text-charcoal/60">Active</div>
          <div className="font-semibold text-blue-700 text-lg">{stats.active}</div>
        </div>
        <div className="rounded-md p-3 border border-charcoal/15 bg-white/60">
          <div className="text-xs text-charcoal/60">Checked-in</div>
          <div className="font-semibold text-indigo-700 text-lg">{stats.checkedIn}</div>
        </div>
        <div className="rounded-md p-3 border border-charcoal/15 bg-white/60">
          <div className="text-xs text-charcoal/60">Completed</div>
          <div className="font-semibold text-green-700 text-lg">{stats.completed}</div>
        </div>
        <div className="rounded-md p-3 border border-charcoal/15 bg-white/60">
          <div className="text-xs text-charcoal/60">Cancelled / Declined</div>
          <div className="font-semibold text-red-700 text-lg">{stats.cancelled}</div>
        </div>
      </div>
      {/* Now Serving / Next In Line */}
      {(()=>{
        const checkedIn = items.find(i=>i.status==='checked-in')
        const pendings = items.filter(i=>i.status==='pending' || i.status==='accepted')
        const now = checkedIn || pendings[0]
        const next = checkedIn ? pendings[0] : pendings[1]
        if(!now && !next) return null
        return (
          <div className="mb-4 grid sm:grid-cols-2 gap-3">
            <div className="rounded-md p-3 border border-charcoal/15 bg-white/60">
              <div className="text-xs text-charcoal/60">Now Serving</div>
              <div className="font-semibold text-charcoal">{now?.userId?.name || '—'}{now?.service?` • ${now.service}`:''}</div>
            </div>
            <div className="rounded-md p-3 border border-charcoal/15 bg-white/60">
              <div className="text-xs text-charcoal/60">Next In Line</div>
              <div className="font-semibold text-charcoal">{next?.userId?.name || '—'}{next?.service?` • ${next.service}`:''}</div>
            </div>
          </div>
        )
      })()}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-2xl text-charcoal">Queue Dashboard</h3>
        <button onClick={load} className="text-sm px-3 py-1 rounded border border-charcoal/20 text-charcoal/90 hover:bg-white/50">Refresh</button>
      </div>
      {loading && <div className="text-charcoal/80">Loading...</div>}
      {error && <div className="text-red-700 mb-2">{error}</div>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-charcoal/90">
            <thead className="text-xs uppercase text-charcoal/60">
              <tr>
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Service</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Joined</th>
                <th className="py-2 pr-3">ETA</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(it=> ['pending','accepted','checked-in'].includes(it.status)).map((it)=> (
                <tr key={it._id} className="border-t border-charcoal/10">
                  <td className="py-2 pr-3">{it.position}</td>
                  <td className="py-2 pr-3">{it.userId?.name || '—'}</td>
                  <td className="py-2 pr-3">{it.userId?.phone || '—'}</td>
                  <td className="py-2 pr-3">{it.service || '—'}</td>
                  <td className="py-2 pr-3">{it.status}</td>
                  <td className="py-2 pr-3">{it.joinTime ? new Date(it.joinTime).toLocaleTimeString() : '-'}</td>
                  <td className="py-2 pr-3">{it.estimatedStart ? new Date(it.estimatedStart).toLocaleTimeString() : '-'}</td>
                  <td className="py-2 pr-0 text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      {it.status === 'pending' && (
                        <>
                          <button onClick={()=>update(it._id,'checked-in')} className="px-2 py-1 text-xs rounded border border-charcoal/20 hover:bg-white/50">Check-in</button>
                          <button onClick={()=>update(it._id,'accepted')} className="px-2 py-1 text-xs rounded border border-green-500/50 text-green-700 hover:bg-green-50">Accept</button>
                          <button onClick={()=>update(it._id,'declined')} className="px-2 py-1 text-xs rounded border border-red-500/50 text-red-700 hover:bg-red-50">Decline</button>
                        </>
                      )}
                      {it.status === 'checked-in' && (
                        <button onClick={()=>update(it._id,'completed')} className="px-2 py-1 text-xs rounded border border-charcoal/20 hover:bg-white/50">Completed</button>
                      )}
                      {it.status === 'accepted' && (
                        <button onClick={()=>update(it._id,'checked-in')} className="px-2 py-1 text-xs rounded border border-charcoal/20 hover:bg-white/50">Check-in</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.filter(it=> ['pending','accepted','checked-in'].includes(it.status)).length===0 && (
                <tr><td className="py-3 text-charcoal/60" colSpan={5}>No customers in queue.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
