const Queue = require('../models/Queue')
const Salon = require('../models/Salon')
const Appointment = require('../models/Appointment')

const ACTIVE_STATUSES = ['pending','accepted','checked-in','received']

function queueError(message, status = 400){
  const err = new Error(message)
  err.status = status
  return err
}

function avgServiceMinutesDefault(){
  return Number(process.env.AVG_SERVICE_MINUTES || 15)
}

async function assertCanJoinQueue(userId){
  const existingAny = await Queue.findOne({ userId, status: { $in: ACTIVE_STATUSES } })
  if(existingAny){
    throw queueError('You already have an active booking. Please cancel it before booking another salon.')
  }
}

async function createQueueEntry({ salonId, userId, service, appointmentId, estimatedStart, io }){
  await assertCanJoinQueue(userId)
  const last = await Queue.findOne({ salonId, status: { $in: ACTIVE_STATUSES } }).sort({ position: -1 })
  const nextPos = (last?.position || 0) + 1
  const payload = {
    salonId,
    userId,
    service,
    position: nextPos,
    joinedAt: new Date(),
    estimatedWaitTime: avgServiceMinutesDefault() * Math.max(nextPos - 1, 0)
  }
  if(appointmentId) payload.appointmentId = appointmentId
  if(estimatedStart) payload.estimatedStart = estimatedStart
  const item = await Queue.create(payload)
  if(io){
    io.emit('queue:new', { salonId, id: item._id.toString(), position: item.position, status: item.status })
  }
  return item
}

async function joinQueue(req, res){
  try{
    const { salonId, service } = req.body
    if(!salonId) return res.status(400).json({ error: 'salonId required' })
    const io = req.app.get('io')
    const item = await createQueueEntry({ salonId, userId: req.user.id, service, io })
    return res.status(201).json(item)
  }catch(err){
    return res.status(err?.status || 400).json({ error: err?.message || 'Unable to join queue' })
  }
}

async function viewQueue(req, res){
  try{
    const { salonId } = req.params
    const items = await Queue.find({ salonId }).sort({ position: 1 }).populate('userId','name phone').populate('appointmentId','startTime status').lean()
    return res.json(items)
  }catch(err){
    return res.status(400).json({ error: 'Failed to load queue' })
  }
}

async function getMyQueue(req, res){
  try{
    const item = await Queue.findOne({ userId: req.user.id, status: { $in: ACTIVE_STATUSES } })
      .sort({ createdAt: -1 })
      .populate('salonId','name')
      .lean()
    return res.json(item || null)
  }catch(err){
    return res.status(400).json({ error: 'Failed to load my booking' })
  }
}

async function cancelQueue(req, res){
  try{
    const { id, reason } = req.body
    let item = null
    if(id){
      item = await Queue.findById(id)
    } else {
      item = await Queue.findOne({ userId: req.user.id, status: { $in: ACTIVE_STATUSES } })
    }
    if(!item) return res.status(404).json({ error: 'No active booking found' })
    // customer can only cancel their own booking
    if(String(item.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' })
    item.status = 'cancelled'
    if(reason) item.cancelReason = reason
    await item.save()
    if(item.appointmentId){
      await Appointment.findByIdAndUpdate(item.appointmentId, { status: 'cancelled', cancellationReason: reason || 'Cancelled from queue' })
    }
    const io = req.app.get('io')
    io.emit('queue:update', { id: item._id.toString(), status: item.status, salonId: String(item.salonId) })
    return res.json({ ok: true })
  }catch(err){
    return res.status(400).json({ error: 'Failed to cancel' })
  }
}

async function syncAppointmentForStatus(item, status){
  if(!item.appointmentId) return
  const updates = {}
  if(status === 'completed'){
    updates.status = 'completed'
  } else if(status === 'no-show'){
    updates.status = 'cancelled'
    updates.cancellationReason = 'Marked as no-show by vendor'
  } else if(status === 'declined'){
    updates.status = 'cancelled'
    updates.cancellationReason = 'Declined by vendor'
  } else if(status === 'cancelled'){
    updates.status = 'cancelled'
  }
  if(Object.keys(updates).length){
    await Appointment.findByIdAndUpdate(item.appointmentId, updates)
  }
}

module.exports = { joinQueue, viewQueue, getMyQueue, cancelQueue, createQueueEntry, assertCanJoinQueue, ACTIVE_STATUSES }

async function updateStatus(req, res){
  try{
    const { id } = req.params
    const { status } = req.body
    const allowed = ['pending','checked-in','no-show','completed','accepted','declined','received','cancelled']
    if(!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })
    const item = await Queue.findById(id)
    if(!item) return res.status(404).json({ error: 'Not found' })
    // verify ownership: the requester must own the salon of this queue item
    const salon = await Salon.findOne({ _id: item.salonId, ownerId: req.user.id })
    if(!salon) return res.status(403).json({ error: 'Forbidden' })
    item.status = status
    if(status === 'checked-in') item.checkinTime = new Date()
    await item.save()
    await syncAppointmentForStatus(item, status)
    // broadcast stub update
    const io = req.app.get('io')
    io.emit('queue:update', { id: item._id.toString(), status, salonId: String(item.salonId) })
    return res.json(item)
  }catch(err){
    return res.status(400).json({ error: 'Update failed' })
  }
}

module.exports.updateStatus = updateStatus
