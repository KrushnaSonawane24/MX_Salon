const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  // Ensure we store only bcrypt hashes and never plain text
  passwordHash: {
    type: String,
    required: true,
    validate: {
      validator: function(v){
        // Accept typical bcrypt formats $2a$, $2b$, $2y$ with 10+ rounds and ~60 chars
        return typeof v === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(v)
      },
      message: 'passwordHash must be a valid bcrypt hash'
    }
  },
  role: { type: String, enum: ['customer','vendor','admin'], default: 'customer', index: true },
  phone: { type: String, unique: true, sparse: true },
  isBanned: { type: Boolean, default: false },
  // Onboarding & preferences
  gender: { type: String, enum: ['male','female','other'], default: undefined },
  preferredService: { type: String },
  preferredStylist: { type: String },
  rememberPreference: { type: Boolean, default: false },
  lastBookingAt: { type: Date },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }})

module.exports = mongoose.model('User', UserSchema)
