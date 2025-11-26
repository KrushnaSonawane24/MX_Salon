const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', index: true, required: true },
  service: { type: String, required: true },
  stylist: { type: String },
  startTime: { type: Date, required: true, index: true },
  status: { type: String, enum: ['scheduled','completed','cancelled'], default: 'scheduled', index: true },
  cancellationReason: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Appointment', AppointmentSchema)
