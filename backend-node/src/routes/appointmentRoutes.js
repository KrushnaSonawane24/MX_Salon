const express = require('express')
const { authMiddleware } = require('../middleware/auth')
const { createAppointment, listMine, cancelAppointment } = require('../controllers/appointmentController')

const router = express.Router()

router.use(authMiddleware)

router.post('/', createAppointment)
router.get('/mine', listMine)
router.patch('/:id/cancel', cancelAppointment)

module.exports = { appointmentRoutes: router }
