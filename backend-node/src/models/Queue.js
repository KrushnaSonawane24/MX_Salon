const mongoose = require('mongoose')

const QueueSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', index: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  status: { type: String, enum: ['pending','accepted','checked-in','declined','cancelled','no-show','completed'], default: 'pending', index: true },
  service: { type: String },
  joinTime: { type: Date, default: Date.now },
  checkinTime: { type: Date },
  estimatedStart: { type: Date },
  // New fields for token queue system
  position: { type: Number, index: true },
  estimatedWaitTime: { type: Number, default: 0 }, // in minutes
  joinedAt: { type: Date },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  cancelReason: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Queue', QueueSchema)
