const express = require('express')
const { authMiddleware } = require('../middleware/auth')
const { savePreferences, getDashboard } = require('../controllers/userController')

const router = express.Router()

router.use(authMiddleware)

router.post('/preferences', savePreferences)
router.get('/dashboard', getDashboard)

module.exports = { userRoutes: router }
