import { io } from 'socket.io-client'

// Align Socket.IO with FastAPI server on port 5000
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
export const socket = io(baseURL, { transports: ['websocket'] })

export function joinSalonRoom(salonId){
  socket.emit('join', { room: `salon:${salonId}` })
}
