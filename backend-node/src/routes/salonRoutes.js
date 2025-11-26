const express = require('express')
const { authMiddleware, requireRoles } = require('../middleware/auth')
const { createSalon, updateSalon, getSalon, listAll, listNear, addFeedback, search, mine } = require('../controllers/salonController')

const router = express.Router()

// Public
router.get('/all', listAll)
router.get('/near', listNear) // /api/salon/near?lat=..&lng=..&radiusKm=5
router.get('/search', search) // /api/salon/search?name=&city=&pincode=
router.get('/:id', getSalon)

// Vendor/Admin
router.post('/', authMiddleware, requireRoles('vendor','admin'), createSalon)
router.put('/:id', authMiddleware, requireRoles('vendor','admin'), updateSalon)

// Current vendor/admin salon
router.get('/mine/current', authMiddleware, requireRoles('vendor','admin'), mine)

// Feedback from customer
router.post('/:id/feedback', addFeedback)

module.exports = { salonRoutes: router }
