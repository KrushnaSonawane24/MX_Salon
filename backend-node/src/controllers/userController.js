const User = require('../models/User')
const Appointment = require('../models/Appointment')

async function savePreferences(req, res){
  try{
    const { gender, preferredService, preferredStylist, rememberPreference } = req.body
    const update = { }
    if(gender) update.gender = gender
    if(preferredService !== undefined) update.preferredService = preferredService
    if(preferredStylist !== undefined) update.preferredStylist = preferredStylist
    if(typeof rememberPreference === 'boolean') update.rememberPreference = rememberPreference
    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true }).select('-passwordHash')
    return res.json(user)
  }catch(err){
    return res.status(400).json({ error: 'Could not save preferences' })
  }
}

async function getDashboard(req, res){
  const userId = req.user.id
  const nextAppt = await Appointment.findOne({ userId, status: 'scheduled', startTime: { $gte: new Date() } }).sort({ startTime: 1 }).lean()
  const lastDone = await Appointment.findOne({ userId, status: 'completed' }).sort({ startTime: -1 }).lean()
  let daysSince = null
  if(lastDone?.startTime){
    daysSince = Math.floor((Date.now() - new Date(lastDone.startTime).getTime()) / (1000*60*60*24))
  }
  const user = await User.findById(userId).select('-passwordHash').lean()
  return res.json({ user, nextAppointment: nextAppt, daysSinceLastBooking: daysSince, quickBookService: user?.rememberPreference ? user?.preferredService : null })
}

module.exports = { savePreferences, getDashboard }
