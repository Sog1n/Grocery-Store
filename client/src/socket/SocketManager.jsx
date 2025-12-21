import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from './useSocket'
import { registerSocketHandlers } from './listeners'

function getCookie(name) {
  if (typeof document === 'undefined') return undefined
  const v = document.cookie.match('(^|;)\s*' + name + '\s*=\s*([^;]+)')
  return v ? v.pop() : undefined
}

export default function SocketManager() {
  // try to read token from redux first, fallback to cookie (accessToken)
  const reduxToken = useSelector(s => s.user?.accessToken)
  const cookieToken = getCookie('accessToken')
  const token = reduxToken || cookieToken
  const socketRef = useSocket(token)
  const dispatch = useDispatch()

  console.log('[SocketManager] Token sources:', {
    reduxToken: reduxToken ? reduxToken.substring(0, 20) + '...' : 'NONE',
    cookieToken: cookieToken ? cookieToken.substring(0, 20) + '...' : 'NONE',
    finalToken: token ? 'EXISTS' : 'NONE'
  })

  useEffect(() => {
    const s = socketRef.current
    if (!s) {
      console.log('[SocketManager] Socket not ready yet, waiting...')
      return
    }
    
    // Wait for socket to be fully connected
    if (!s.connected) {
      console.log('[SocketManager] Socket exists but not connected yet, setting up connect handler')
      const handleConnect = () => {
        console.log('[SocketManager] Socket connected! Now registering handlers on socket', s.id)
        registerSocketHandlers(s, dispatch)
        s.off('connect', handleConnect) // cleanup
      }
      s.on('connect', handleConnect)
      return () => s.off('connect', handleConnect)
    }
    
    // Socket already connected
    console.log('[SocketManager] Socket already connected, registering handlers on socket', s.id)
    registerSocketHandlers(s, dispatch)

    return () => {
      // socket.io will cleanup listeners on disconnect
    }
  }, [socketRef.current, dispatch])

  return null
}
