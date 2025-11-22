import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket(token) {
  const socketRef = useRef(null)

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:8081'
    const socket = io(url, { auth: { token } })
    socketRef.current = socket

    socket.on('connect', () => console.log('admin socket connected', socket.id))
    socket.on('disconnect', () => console.log('admin socket disconnected'))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  return socketRef
}
