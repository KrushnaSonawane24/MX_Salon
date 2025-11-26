const express = require('express')
const Queue = require('../models/Queue')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', authMiddleware, async (req,res)=>{
  const items = await Queue.find({ userId: req.user.id }).limit(50).lean()
  return res.json(items)
})

router.post('/', authMiddleware, async (req,res)=>{
  try{
    const { salonId, estimatedStart } = req.body
    const item = await Queue.create({ salonId, userId: req.user.id, estimatedStart })
    // Broadcast stub: inform salon room listeners
    const io = req.app.get('io')
    io.emit('queue:new', { salonId: String(salonId), userId: req.user.id })
    return res.status(201).json(item)
  }catch(err){
    return res.status(400).json({ error: 'Invalid data' })
  }
})

module.exports = { queueRouter: router }
