const express = require('express')
const Salon = require('../models/Salon')
const { authMiddleware, requireRoles } = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req,res)=>{
  const items = await Salon.find().limit(50).lean()
  return res.json(items)
})

router.get('/:id', async (req,res)=>{
  const item = await Salon.findById(req.params.id).lean()
  if(!item) return res.status(404).json({ error: 'Not found' })
  return res.json(item)
})

router.post('/', authMiddleware, requireRoles('vendor','admin'), async (req,res)=>{
  try{
    const data = req.body
    data.ownerId = req.user.id
    const item = await Salon.create(data)
    return res.status(201).json(item)
  }catch(err){
    return res.status(400).json({ error: 'Invalid data' })
  }
})

router.put('/:id', authMiddleware, requireRoles('vendor','admin'), async (req,res)=>{
  const item = await Salon.findOneAndUpdate({ _id: req.params.id, ownerId: req.user.id }, req.body, { new: true })
  if(!item) return res.status(404).json({ error: 'Not found or not owner' })
  return res.json(item)
})

module.exports = { salonRouter: router }
