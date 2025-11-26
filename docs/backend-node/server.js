require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const { Server } = require('socket.io')

const { authRoutes } = require('./src/routes/authRoutes')
const { salonRoutes } = require('./src/routes/salonRoutes')
const { queueRoutes } = require('./src/routes/queueRoutes')
const { adminRoutes } = require('./src/routes/adminRoutes')
const { userRoutes } = require('./src/routes/userRoutes')
const { appointmentRoutes } = require('./src/routes/appointmentRoutes')
const { connectCache } = require('./src/utils/cache')

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req,res)=> res.json({ message: 'MX.Salon API server', health: '/health', docs: null }))
app.get('/health', (req,res)=> res.json({ status: 'ok' }))

// API routes (MVC)
app.use('/api/auth', authRoutes)
app.use('/api/salon', salonRoutes)
app.use('/api/salons', salonRoutes) // backward-compat alias
app.use('/api/queue', queueRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)
app.use('/api/appointments', appointmentRoutes)

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*'}})

io.on('connection', (socket)=>{
  socket.on('disconnect', ()=>{})
})

app.set('io', io)

const PORT = process.env.PORT || 5000

async function start(){
  try{
    if(process.env.REDIS_URL) await connectCache()
  }catch(err){
    console.warn('Cache disabled:', err.message)
  }
  try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  }catch(err){
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
  server.listen(PORT, ()=>{
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}

start()
