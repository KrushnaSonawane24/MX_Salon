const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function register(req, res){
  try{
    let { name, email, password, role, phone } = req.body
    name = (name||'').toString().trim()
    email = (email||'').toString().trim().toLowerCase()
    password = (password||'').toString()
    phone = (phone||'').toString().trim()
    if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    // Prevent accepting pre-hashed passwords to avoid double hashing
    if(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{20,}/.test(password)){
      console.warn('Register rejected: password appears to be a bcrypt hash')
      return res.status(400).json({ error: 'Password must be plain text, not a hash' })
    }
    // Password strength: min 8, includes letter and number
    const strongPw = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
    if(!strongPw) return res.status(400).json({ error: 'Password must be at least 8 chars with letters and numbers' })
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if(!emailOk) return res.status(400).json({ error: 'Invalid email' })
    if(phone && !/^\+?\d{10,15}$/.test(phone)) return res.status(400).json({ error: 'Invalid phone' })
    // Prevent privilege escalation: only allow customer or vendor on public register
    const roleWhitelist = ['customer','vendor']
    const safeRole = roleWhitelist.includes(role) ? role : 'customer'
    const exists = await User.findOne({ email })
    if(exists){
      console.warn(`Register conflict: email already registered ${email}`)
      return res.status(409).json({ error: 'Email already registered' })
    }
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
    if(Number.isNaN(saltRounds) || saltRounds < 10){
      console.warn(`BCRYPT_SALT_ROUNDS misconfigured: using default 10 (got ${process.env.BCRYPT_SALT_ROUNDS})`)
    }
    const effectiveRounds = (!Number.isNaN(saltRounds) && saltRounds >= 10) ? saltRounds : 10
    const passwordHash = await bcrypt.hash(password, effectiveRounds)
    const user = await User.create({ name, email, passwordHash, role: safeRole, phone: phone || undefined })
    console.info(`User registered: ${user._id} ${user.email}`)
    return res.status(201).json({ id: user._id, email: user.email })
  }catch(err){
    console.error('Register error:', err?.message)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function login(req, res){
  try{
    let { email, password, identifier } = req.body
    email = (email||'').toString().trim().toLowerCase()
    identifier = (identifier||'').toString().trim()
    password = (password||'').toString()
    if(!email && !identifier) return res.status(400).json({ error: 'Missing credentials' })

    const query = identifier
      ? { $or: [{ email: identifier.toLowerCase() }, { phone: identifier }] }
      : { email }

    const user = await User.findOne(query)
    if(!user){
      console.warn(`Login failed: user not found for ${identifier || email}`)
      return res.status(404).json({ error: 'User not found' })
    }
    if(user.isBanned){
      console.warn(`Login blocked: banned account ${user._id}`)
      return res.status(403).json({ error: 'Account banned' })
    }
    if(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{20,}/.test(password)){
      console.warn('Login rejected: password appears to be a bcrypt hash')
      return res.status(400).json({ error: 'Password must be plain text, not a hash' })
    }
    if(!user.passwordHash){
      console.error(`Login error: passwordHash missing for user ${user._id}`)
      return res.status(500).json({ error: 'Password not set. Please reset your password.' })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if(!ok){
      console.warn(`Login failed: incorrect password for user ${user._id}`)
      return res.status(401).json({ error: 'Incorrect password' })
    }
    const secret = process.env.JWT_SECRET
    if(!secret || !secret.trim()){
      console.error('Login error: JWT_SECRET is missing')
      return res.status(500).json({ error: 'Auth server misconfigured. Contact support.' })
    }
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    console.info(`Login success: ${user._id}`)
    return res.json({ token, role: user.role, name: user.name, email: user.email })
  }catch(err){
    console.error('Login error:', err?.message)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function getMe(req, res){
  const user = await User.findById(req.user.id).select('-passwordHash').lean()
  if(!user) return res.status(404).json({ error: 'Not found' })
  return res.json(user)
}

module.exports = { register, login, getMe }
