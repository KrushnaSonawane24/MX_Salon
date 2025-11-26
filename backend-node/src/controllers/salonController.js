const Salon = require('../models/Salon')
const { haversineKm } = require('../utils/geo')
const Queue = require('../models/Queue')

async function attachActiveCounts(items){
  try{
    const ids = items.map(s=> s._id)
    const activeStatuses = ['pending','accepted','checked-in']
    const rows = await Queue.aggregate([
      { $match: { salonId: { $in: ids }, status: { $in: activeStatuses } } },
      { $group: { _id: '$salonId', count: { $sum: 1 } } }
    ])
    const map = new Map(rows.map(r=> [String(r._id), r.count]))
    return items.map(s=> ({ ...s, queueCountActive: map.get(String(s._id)) || 0 }))
  }catch{
    return items
  }
}

async function createSalon(req, res){
  try{
    const ownerId = req.user.id
    const { name, location, photos, videos, services, staffCount, chairsCount, experienceYears, businessEmail, contactNo, city, timings } = req.body
    if(!name) return res.status(400).json({ error: 'Name required' })
    const salonData = { 
      name, ownerId, location, photos, services, openHours: {}, ratingsSummary: {}, videos, 
      staffCount, chairsCount, experienceYears, businessEmail, contactNo, city
    }
    if(timings) salonData.timings = timings
    const salon = await Salon.create(salonData)
    return res.status(201).json(salon)
  }catch(err){
    return res.status(400).json({ error: 'Invalid data' })
  }
}

async function updateSalon(req, res){
  try{
    const id = req.params.id
    const ownerId = req.user.id
    const updateData = { ...req.body }
    // If timings provided, ensure it's properly structured
    if(updateData.timings && typeof updateData.timings === 'object') {
      updateData.timings = {
        open: updateData.timings.open || '09:00',
        close: updateData.timings.close || '18:00'
      }
    }
    const updated = await Salon.findOneAndUpdate({ _id: id, ownerId }, updateData, { new: true })
    if(!updated) return res.status(404).json({ error: 'Not found or not owner' })
    return res.json(updated)
  }catch(err){
    return res.status(400).json({ error: 'Update failed' })
  }
}

async function getSalon(req, res){
  const item = await Salon.findById(req.params.id).lean()
  if(!item) return res.status(404).json({ error: 'Not found' })
  return res.json(item)
}

async function listAll(req, res){
  let items = await Salon.find().limit(200).lean()
  if(String(req.query.counts||'')==='1') items = await attachActiveCounts(items)
  return res.json(items)
}

async function listNear(req, res){
  const { lat, lng, radiusKm = 5 } = req.query
  const origin = { lat: Number(lat), lng: Number(lng) }
  if(Number.isNaN(origin.lat) || Number.isNaN(origin.lng)) return res.status(400).json({ error: 'lat/lng required' })
  const items = await Salon.find().lean()
  let within = items.map(s => ({ ...s, distanceKm: haversineKm(origin, (s.location||{})) }))
    .filter(s => s.distanceKm <= Number(radiusKm))
    .sort((a,b)=> a.distanceKm - b.distanceKm)
  if(String(req.query.counts||'')==='1') within = await attachActiveCounts(within)
  return res.json(within)
}

async function addFeedback(req, res){
  const id = req.params.id
  const { customerName, rating, message } = req.body
  if(!customerName || typeof rating === 'undefined') return res.status(400).json({ error: 'Missing fields' })
  const feedback = { customerName, rating: Number(rating), message, date: new Date() }
  const salon = await Salon.findByIdAndUpdate(id, { $push: { feedbacks: feedback } }, { new: true })
  if(!salon) return res.status(404).json({ error: 'Not found' })
  // update ratingsSummary
  const count = (salon.feedbacks?.length || 0)
  const total = (salon.feedbacks||[]).reduce((acc,f)=> acc + (f.rating||0), 0)
  const average = count ? total / count : 0
  salon.ratingsSummary = { average, count }
  await salon.save()
  return res.json(salon)
}

async function search(req, res){
  const { name, city, pincode, area } = req.query
  const q = {}
  if(name) q.name = { $regex: name, $options: 'i' }
  if(city) q.city = { $regex: city, $options: 'i' }
  if(area) q.city = { $regex: area, $options: 'i' } // area is treated as city
  if(pincode) q['location.pincode'] = String(pincode)
  let items = await Salon.find(q).sort({ 'ratingsSummary.average': -1 }).limit(100).lean()
  if(String(req.query.counts||'')==='1') items = await attachActiveCounts(items)
  return res.json(items)
}

async function mine(req, res){
  const ownerId = req.user.id
  const salon = await Salon.findOne({ ownerId }).lean()
  return res.json(salon || null)
}

module.exports = { createSalon, updateSalon, getSalon, listAll, listNear, addFeedback, search, mine }
