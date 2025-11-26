import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    const url = import.meta.env.VITE_API_BASE || 'http://localhost:5001'
    socket = io(url, { transports: ['websocket'], autoConnect: true })
  }
  return socket
}

export default getSocket()
