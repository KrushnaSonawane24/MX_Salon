const express = require('express')
const { authMiddleware, requireRoles } = require('../middleware/auth')
const { getAllUsers, getAllSalons, banUser, unbanUser, salonAnalytics } = require('../controllers/adminController')

const router = express.Router()

router.use(authMiddleware, requireRoles('admin'))

router.get('/users', getAllUsers)
router.get('/salons', getAllSalons)
router.post('/users/:userId/ban', banUser)
router.post('/users/:userId/unban', unbanUser)
router.get('/analytics/salons', salonAnalytics)

module.exports = { adminRoutes: router }
