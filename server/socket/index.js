import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'
import jwt from 'jsonwebtoken'

let io = null

export async function initSocket(httpServer, opts = {}) {
  if (io) return io

  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' },
    ...opts
  })

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  try {
    const pubClient = createClient({ url: redisUrl })
    const subClient = pubClient.duplicate()
    await pubClient.connect()
    await subClient.connect()
    io.adapter(createAdapter(pubClient, subClient))
    console.log('Socket.io using Redis adapter')
  } catch (err) {
    console.warn('Redis adapter unavailable, continuing without adapter. This is fine for single-node development.', err?.message || err)
  }

  // simple auth: expect token in handshake.auth.token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next()
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.data.user = payload
      return next()
    } catch (err) {
      // allow unauthenticated sockets for now, but you can change to next(err)
      return next()
    }
  })

  io.on('connection', (socket) => {
    const u = socket.data.user
    // Join broadcast rooms
    socket.join('user:all')  // ALL users (for product/category updates)
    if (u?.role === 'admin') socket.join('admin:all')
    if (u?.id) socket.join(`user:${u.id}`)  // per-user room for orders

    socket.on('disconnect', () => {
      // placeholder for cleanup
    })
  })

  console.log('Socket.io initialized')
  return io
}

export function getIO() {
  if (!io) throw new Error('Socket not initialized yet')
  return io
}
