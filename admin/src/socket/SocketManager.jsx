import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '../socket/useSocket'
import { registerSocketHandlers } from './listeners'

function getCookie(name) {
  if (typeof document === 'undefined') return undefined
  const v = document.cookie.match('(^|;)\s*' + name + '\s*=\s*([^;]+)')
  return v ? v.pop() : undefined
}

export default function SocketManager() {
  const reduxToken = useSelector(s => s.user?.accessToken)
  const token = reduxToken || getCookie('accessToken')
  const socketRef = useSocket(token)
  const dispatch = useDispatch()

  useEffect(() => {
    const s = socketRef.current
    if (!s) return
    console.log('[Admin SocketManager] Registering socket handlers on socket', s.id)
    registerSocketHandlers(s, dispatch)
    return () => {}
  }, [socketRef.current, dispatch])

  return null
}
