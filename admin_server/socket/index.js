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
    console.log('Admin socket using Redis adapter')
  } catch (err) {
    console.warn('Redis adapter unavailable for admin socket, continuing without adapter. This is fine for single-node development.', err?.message || err)
  }

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      console.log('[Admin Socket Auth]', { 
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      })
      
      if (!token) {
        console.log('[Admin Socket Auth] No token provided, allowing anonymous connection')
        return next()
      }
      
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      console.log('[Admin Socket Auth] Token verified:', { 
        userId: payload.id,
        role: payload.role 
      })
      
      socket.data.user = payload
      return next()
    } catch (err) {
      console.error('[Admin Socket Auth] Token verification failed:', err.message)
      return next()
    }
  })

  io.on('connection', (socket) => {
    const u = socket.data.user
    console.log('[Admin Socket] New connection:', {
      socketId: socket.id,
      hasUser: !!u,
      userId: u?.id,
      userRole: u?.role
    })
    
    // Join broadcast rooms
    socket.join('user:all')  // ALL users (for product/category updates)
    if (u?.role === 'admin') {
      socket.join('admin:all')
      console.log('[Admin Socket] Joined admin:all room')
    }
    if (u?.id) {
      socket.join(`user:${u.id}`)
      console.log('[Admin Socket] Joined user room:', `user:${u.id}`)
    } else {
      console.log('[Admin Socket] No user ID, cannot join personal room')
    }
  })

  console.log('Admin socket initialized')
  return io
}

export function getIO() {
  if (!io) throw new Error('Socket not initialized yet')
  return io
}
