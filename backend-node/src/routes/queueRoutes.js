const express = require('express')
const { authMiddleware } = require('../middleware/auth')
const { joinQueue, viewQueue, updateStatus, getMyQueue, cancelQueue } = require('../controllers/queueController')

const router = express.Router()

router.post('/join', authMiddleware, joinQueue)
router.get('/mine/current', authMiddleware, getMyQueue)
router.post('/cancel', authMiddleware, cancelQueue)
router.patch('/:id/status', authMiddleware, updateStatus)
router.get('/:salonId', viewQueue)
// Also support POST /join/:salonId for backward compatibility
router.post('/join/:salonId', authMiddleware, (req, res) => {
  req.body.salonId = req.params.salonId
  return joinQueue(req, res)
})

module.exports = { queueRoutes: router }
