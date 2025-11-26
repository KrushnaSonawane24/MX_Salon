const User = require('../models/User')
const Salon = require('../models/Salon')

async function getAllUsers(req, res){
  const users = await User.find().select('-passwordHash').limit(500).lean()
  return res.json(users)
}

async function getAllSalons(req, res){
  const salons = await Salon.find().limit(500).lean()
  return res.json(salons)
}

async function banUser(req, res){
  const { userId } = req.params
  const user = await User.findByIdAndUpdate(userId, { isBanned: true }, { new: true }).select('-passwordHash')
  if(!user) return res.status(404).json({ error: 'User not found' })
  return res.json(user)
}

async function unbanUser(req, res){
  const { userId } = req.params
  const user = await User.findByIdAndUpdate(userId, { isBanned: false }, { new: true }).select('-passwordHash')
  if(!user) return res.status(404).json({ error: 'User not found' })
  return res.json(user)
}

async function salonAnalytics(req, res){
  const agg = await Salon.aggregate([
    { $project: { name: 1, rating: 1, count: { $size: { $ifNull: ['$feedbacks', []] } } } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, totalSalons: { $sum: 1 }, totalFeedbacks: { $sum: '$count' } } },
  ])
  return res.json(agg[0] || { avgRating: 0, totalSalons: 0, totalFeedbacks: 0 })
}

module.exports = { getAllUsers, getAllSalons, banUser, unbanUser, salonAnalytics }
