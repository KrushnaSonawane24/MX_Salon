const Appointment = require('../models/Appointment')
const User = require('../models/User')
const { createQueueEntry } = require('./queueController')

async function createAppointment(req, res){
  try{
    const { salonId, service, stylist, startTime } = req.body
    if(!salonId || !service || !startTime) return res.status(400).json({ error: 'Missing fields' })
    const start = new Date(startTime)
    const appt = await Appointment.create({ userId: req.user.id, salonId, service, stylist, startTime: start })
    let queueItem = null
    try{
      const io = req.app.get('io')
      queueItem = await createQueueEntry({
        salonId,
        userId: req.user.id,
        service,
        appointmentId: appt._id,
        estimatedStart: start,
        io
      })
    }catch(err){
      await Appointment.findByIdAndDelete(appt._id)
      return res.status(err?.status || 400).json({ error: err?.message || 'Unable to add to queue. Please try again.' })
    }
    // update user's lastBookingAt for personal touch
    await User.findByIdAndUpdate(req.user.id, { $set: { lastBookingAt: start } })
    return res.status(201).json({ appointment: appt, queueItem })
  }catch(err){
    return res.status(400).json({ error: 'Could not create appointment' })
  }
}

async function listMine(req, res){
  const items = await Appointment.find({ userId: req.user.id }).sort({ startTime: 1 }).limit(100).populate('salonId', 'name location contactNo').lean()
  return res.json(items)
}

async function cancelAppointment(req, res){
  try{
    const { id } = req.params
    const { reason } = req.body
    const appointment = await Appointment.findById(id)
    if(!appointment) return res.status(404).json({ error: 'Appointment not found' })
    if(appointment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized' })
    }
    if(appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Already cancelled' })
    }
    appointment.status = 'cancelled'
    appointment.cancellationReason = reason
    await appointment.save()
    
    // Emit socket event for real-time update
    const io = req.app.get('io')
    io.emit('appointment:cancelled', { appointmentId: id, salonId: appointment.salonId })
    
    return res.json(appointment)
  }catch(err){
    return res.status(400).json({ error: 'Failed to cancel appointment' })
  }
}

module.exports = { createAppointment, listMine, cancelAppointment }
