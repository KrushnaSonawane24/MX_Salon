require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../src/models/User')

async function main(){
  const uri = process.env.MONGO_URI
  if(!uri){
    console.error('MONGO_URI not set in env')
    process.exit(1)
  }
  await mongoose.connect(uri)
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const plain = process.env.ADMIN_PASSWORD || 'Admin123!'
  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  const hash = await bcrypt.hash(plain, (!Number.isNaN(rounds) && rounds >= 10) ? rounds : 10)
  const existing = await User.findOne({ email })
  if(existing){
    existing.passwordHash = hash
    existing.role = 'admin'
    existing.isBanned = false
    await existing.save()
    console.log(`Updated admin user: ${existing._id} ${email}`)
  } else {
    const user = await User.create({ name: 'Admin', email, passwordHash: hash, role: 'admin' })
    console.log(`Created admin user: ${user._id} ${email}`)
  }
  console.log(`Admin credentials -> email: ${email} password: ${plain}`)
  await mongoose.disconnect()
}

main().catch(err=>{
  console.error('Seed admin failed:', err)
  process.exit(1)
})