import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { env } from '@/lib/env'
import type { SocketEvents, Message, User, Room } from '@/types'

export function useSocket(serverUrl?: string) {
  const socketUrl = serverUrl || env.websocketUrl
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3,
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat server')
      setIsConnected(true)
      setError(null)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason)
      setIsConnected(false)
      
      // Auto-reconnect logic
      if (reason === 'io server disconnect') {
        // Server disconnected, don't auto-reconnect
        setError('Server disconnected')
      } else {
        // Network issue, attempt to reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          newSocket.connect()
        }, 5000)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setError('Connection failed')
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      newSocket.close()
    }
  }, [socketUrl])

  const emit = <K extends keyof SocketEvents>(
    event: K,
    data: Parameters<SocketEvents[K]>[0]
  ) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  const on = <K extends keyof SocketEvents>(
    event: K,
    handler: SocketEvents[K]
  ) => {
    if (socket) {
      socket.on(event as string, handler)
    }
  }

  const off = <K extends keyof SocketEvents>(
    event: K,
    handler?: SocketEvents[K]
  ) => {
    if (socket) {
      socket.off(event as string, handler)
    }
  }

  const joinRoom = (roomId: string, userAddress: string) => {
    if (socket && isConnected) {
      socket.emit('room:join', roomId, userAddress)
    }
  }

  const leaveRoom = (roomId: string, userAddress: string) => {
    if (socket && isConnected) {
      socket.emit('room:leave', roomId, userAddress)
    }
  }

  const sendMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (socket && isConnected) {
      socket.emit('message:send', message)
    }
  }

  const startTyping = (roomId: string, userAddress: string) => {
    if (socket && isConnected) {
      socket.emit('typing:start', roomId, userAddress)
    }
  }

  const stopTyping = (roomId: string, userAddress: string) => {
    if (socket && isConnected) {
      socket.emit('typing:stop', roomId, userAddress)
    }
  }

  const authenticateUser = (userAddress: string, signature: string) => {
    if (socket && isConnected) {
      socket.emit('auth:user', { address: userAddress, signature })
    }
  }

  return {
    socket,
    isConnected,
    error,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    authenticateUser,
  }
}
