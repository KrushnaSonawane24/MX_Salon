import React from 'react'
import { motion } from 'framer-motion'
import api, { setAuth } from '../../lib/api'
import AddressAutocomplete from './AddressAutocomplete'

export default function VendorProfile(){
  const [salon, setSalon] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [editMode, setEditMode] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '', businessEmail: '', contactNo: '', city: '',
    location: { address: '', pincode: '' },
    experienceYears: '', staffCount: '', chairsCount: '', services: '', photosUrls: '',
    timings: { open: '09:00', close: '18:00' }
  })
  const [hint, setHint] = React.useState('')
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(()=>{
    let cancelled = false
    async function load(){
      setLoading(true); setError(''); setHint('')
      try{
    const { data } = await api.get('/salon/mine/current')
        if(!cancelled) {
          setSalon(data)
          if(data) {
            setForm({
              name: data.name || '',
              businessEmail: data.businessEmail || '',
              contactNo: data.contactNo || '',
              city: data.city || '',
              experienceYears: data.experienceYears || '',
              staffCount: data.staffCount || '',
              chairsCount: data.chairsCount || '',
              services: (data.services||[]).join(', '),
              photosUrls: (data.photos||[]).join(', '),
              location: {
                address: data.location?.address || '',
                pincode: data.location?.pincode || '',
              },
              timings: data.timings || { open: '09:00', close: '18:00' }
            })
          }
        }
      }catch{ if(!cancelled) setError('Failed to load salon profile') }
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
    } else if(name.startsWith('timings.')){
      const key = name.split('.')[1]
      setForm(f=> ({ ...f, timings: { ...f.timings, [key]: value } }))
    } else if(name==='services'){
      setForm(f=> ({ ...f, services: value }))
    } else {
      setForm(f=> ({ ...f, [name]: value }))
    }
  }

  function locationIsExact(){
    return !!form.location.address
  }

  async function handlePhotoUpload(e){
    const files = Array.from(e.target.files || [])
    if(files.length === 0) return
    
    setUploading(true)
    setError('')
    
    try {
      // For now, we'll use a simple approach - convert to data URLs
      // In production, you'd upload to cloud storage (S3, Cloudinary, etc.)
      const uploadPromises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
      })
      
      const dataUrls = await Promise.all(uploadPromises)
      const existingPhotos = form.photosUrls ? form.photosUrls.split(',').map(u=>u.trim()).filter(Boolean) : []
      const newPhotos = [...existingPhotos, ...dataUrls]
      setForm(f=> ({ ...f, photosUrls: newPhotos.join(', ') }))
      setHint(`${files.length} photo(s) added. Save to update profile.`)
    } catch(err) {
      setError('Failed to process photos')
    } finally {
      setUploading(false)
    }
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
        },
        timings: form.timings
      }
      const { data } = await api.put(`/salon/${salon._id}`, payload)
      setSalon(data); setHint('Profile updated successfully'); setEditMode(false)
    }catch(err){ 
      setError(err?.response?.data?.error || 'Update failed') 
    }
  }

  if(loading) return <div className="container mx-auto px-4 py-12 text-charcoal/80">Loading...</div>
  if(error && !salon) return <div className="container mx-auto px-4 py-12 text-red-700">{error}</div>

  if(salon){
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-3xl text-charcoal">Salon Profile</h2>
            {!editMode && (
              <button onClick={()=>setEditMode(true)} className="text-sm px-3 py-1 rounded border border-charcoal/20 text-charcoal/90 hover:bg-white/50">Edit Profile</button>
            )}
          </div>
          {hint && <div className="text-sm text-green-800 mb-2">{hint}</div>}
          {error && <div className="text-sm text-red-700 mb-2">{error}</div>}
          {!editMode ? (
          <div className="grid sm:grid-cols-2 gap-4 text-charcoal/90">
            <div><span className="font-semibold">Name:</span> {salon.name}</div>
            <div><span className="font-semibold">Business Email:</span> {salon.businessEmail || '-'}</div>
            <div><span className="font-semibold">Contact No:</span> {salon.contactNo || '-'}</div>
            <div><span className="font-semibold">City:</span> {salon.city || '-'}</div>
            <div className="sm:col-span-2"><span className="font-semibold">Address:</span> {salon.location?.address || '-'}</div>
            <div><span className="font-semibold">Pincode:</span> {salon.location?.pincode || '-'}</div>
            <div><span className="font-semibold">Timings:</span> {salon.timings?.open || '09:00'} - {salon.timings?.close || '18:00'}</div>
            <div><span className="font-semibold">Experience (yrs):</span> {salon.experienceYears || 0}</div>
            <div><span className="font-semibold">Staff:</span> {salon.staffCount || 0}</div>
            <div><span className="font-semibold">Chairs:</span> {salon.chairsCount || 0}</div>
            <div className="sm:col-span-2"><span className="font-semibold">Services:</span> {(salon.services||[]).join(', ') || '-'}</div>
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
              <label className="block text-sm mb-1">Opening Time</label>
              <input name="timings.open" type="time" value={form.timings.open} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Closing Time</label>
              <input name="timings.close" type="time" value={form.timings.close} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Experience (years)</label>
              <input name="experienceYears" type="number" value={form.experienceYears} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Staff Count</label>
              <input name="staffCount" type="number" value={form.staffCount} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div>
              <label className="block text-sm mb-1">Chairs Count</label>
              <input name="chairsCount" type="number" value={form.chairsCount} onChange={onChange} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Services (comma separated)</label>
              <input name="services" value={form.services} onChange={onChange} placeholder="Haircut, Shave, Beard Styling, Facial" className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Upload Salon Photos</label>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 text-charcoal" />
              {uploading && <div className="text-sm text-charcoal/60 mt-1">Uploading...</div>}
              <div className="text-xs text-charcoal/60 mt-1">You can also paste image URLs (comma separated) below</div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Photos (URLs, comma separated)</label>
              <textarea name="photosUrls" value={form.photosUrls} onChange={onChange} placeholder="https://...jpg, https://...png" rows={3} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white/70 focus:ring-2 focus:ring-teal text-charcoal" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-end gap-2">
              <button type="button" onClick={()=>setEditMode(false)} className="px-3 py-1 rounded border border-charcoal/20 text-charcoal/80 hover:bg-white/50">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded text-charcoal" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C97C5D 100%)' }}>Save Changes</button>
            </div>
          </form>
          )}
          {(salon.photos?.length>0) && (
            <div className="mt-4">
              <h4 className="font-semibold text-charcoal mb-2">Salon Photos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {salon.photos.map((src,idx)=> (
                  <img key={idx} src={src} alt="Salon" className="w-full h-24 object-cover rounded" />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return <div className="container mx-auto px-4 py-12 text-charcoal/80">No salon profile found. Please create one from the dashboard.</div>
}


