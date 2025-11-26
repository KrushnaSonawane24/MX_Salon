const mongoose = require('mongoose')

const LocationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  address: String,
  pincode: String,
},{ _id: false })

const RatingsSummarySchema = new mongoose.Schema({
  average: { type: Number, default: 0 },
  count: { type: Number, default: 0 },
},{ _id: false })

const FeedbackSchema = new mongoose.Schema({
  customerName: String,
  rating: Number,
  message: String,
  date: { type: Date, default: Date.now },
},{ _id: false })

const SalonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: { type: LocationSchema, default: {} },
  photos: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  services: { type: [String], default: [] },
  ratingsSummary: { type: RatingsSummarySchema, default: {} },
  rating: { type: Number, default: 0 },
  feedbacks: { type: [FeedbackSchema], default: [] },
  staffCount: { type: Number, default: 0 },
  chairsCount: { type: Number, default: 0 },
  experienceYears: { type: Number, default: 0 },
  businessEmail: { type: String },
  contactNo: { type: String },
  city: { type: String },
  openHours: { type: Map, of: String, default: {} },
  timings: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' }
  },
}, { timestamps: true })

module.exports = mongoose.model('Salon', SalonSchema)
