import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket(token) {
  const socketRef = useRef(null)

  useEffect(() => {
    // Connect to ADMIN_SERVER (8081) to receive product/category/subcategory events
    // that are emitted from admin actions
    const url = import.meta.env.VITE_ADMIN_SOCKET_URL || 'http://localhost:8081'
    console.log('[useSocket] Connecting to:', url, '| Token:', token ? 'EXISTS' : 'NONE')
    
    // Connect socket even without token (for anonymous users to see realtime updates)
    const socket = io(url, { 
      auth: { token: token || undefined },
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Client] socket connected to admin_server', socket.id)
      console.log('[Client] Auth token sent:', token ? token.substring(0, 30) + '...' : 'NONE')
    })
    socket.on('disconnect', () => console.log('[Client] socket disconnected'))
    socket.on('connect_error', (err) => console.error('[Client] socket connection error:', err.message))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  return socketRef
}
