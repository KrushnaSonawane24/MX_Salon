const express = require('express')
const { register, login, getMe } = require('../controllers/authController')
const { authMiddleware } = require('../middleware/auth')
const { rateLimit } = require('../middleware/rateLimit')

const router = express.Router()

router.get('/register', (req,res)=>{
  res.json({ message: 'Use POST /api/auth/register with JSON body', example: { name:'Demo', email:'demo@example.com', password:'secret123', role:'customer', phone:'+911234567890' } })
})
router.get('/login', (req,res)=>{
  res.json({ message: 'Use POST /api/auth/login with JSON body', example: { email:'demo@example.com', password:'secret123' } })
})

router.post('/register', rateLimit, register)
router.post('/login', rateLimit, login)

// current user
router.get('/me', authMiddleware, getMe)

module.exports = { authRoutes: router }
