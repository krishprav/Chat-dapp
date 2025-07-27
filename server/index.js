const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { ethers } = require('ethers')

const app = express()
const server = createServer(app)

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// In-memory storage (in production, use a database)
const rooms = new Map()
const users = new Map()
const messages = new Map()

// Helper functions
function generateMessageId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function verifySignature(message, signature, address) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Authentication
  socket.on('auth:user', ({ address, signature }) => {
    const message = `Authenticate for Web3 Chat Room: ${Date.now()}`
    
    // In a real implementation, you'd verify the signature properly
    // For demo purposes, we'll accept any signature
    const isValid = true // verifySignature(message, signature, address)
    
    if (isValid) {
      socket.userAddress = address
      socket.authenticated = true
      
      // Update user status
      users.set(address, {
        address,
        socketId: socket.id,
        isOnline: true,
        lastSeen: Date.now()
      })

      socket.emit('auth:success')
      console.log(`User authenticated: ${address}`)
    } else {
      socket.emit('auth:failed', 'Invalid signature')
      console.log(`Authentication failed for: ${address}`)
    }
  })

  // Join room
  socket.on('room:join', (roomId, userAddress) => {
    if (!socket.authenticated) {
      socket.emit('error', 'Not authenticated')
      return
    }

    socket.join(roomId)
    socket.currentRoom = roomId

    // Add user to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        members: new Set(),
        admins: new Set()
      })
    }

    const room = rooms.get(roomId)
    room.members.add(userAddress)

    // Notify others in the room
    socket.to(roomId).emit('user:join', {
      address: userAddress,
      isOnline: true
    })

    // Send recent messages to the joining user
    const roomMessages = messages.get(roomId) || []
    socket.emit('room:messages', roomMessages.slice(-50)) // Last 50 messages

    console.log(`User ${userAddress} joined room ${roomId}`)
  })

  // Leave room
  socket.on('room:leave', (roomId, userAddress) => {
    socket.leave(roomId)
    
    const room = rooms.get(roomId)
    if (room) {
      room.members.delete(userAddress)
    }

    socket.to(roomId).emit('user:leave', userAddress)
    console.log(`User ${userAddress} left room ${roomId}`)
  })

  // Create room
  socket.on('room:create', (roomData) => {
    if (!socket.authenticated) {
      socket.emit('error', 'Not authenticated')
      return
    }

    const room = {
      ...roomData,
      members: new Set([socket.userAddress]),
      admins: new Set([socket.userAddress])
    }

    rooms.set(roomData.id, room)
    console.log(`Room created: ${roomData.id} by ${socket.userAddress}`)

    // Broadcast room creation to all users
    io.emit('room:update', roomData)
  })

  // Send message
  socket.on('message:send', (messageData) => {
    if (!socket.authenticated) {
      socket.emit('error', 'Not authenticated')
      return
    }

    const message = {
      id: generateMessageId(),
      ...messageData,
      timestamp: Date.now(),
      sender: socket.userAddress
    }

    // Store message
    if (!messages.has(message.roomId)) {
      messages.set(message.roomId, [])
    }
    messages.get(message.roomId).push(message)

    // Broadcast to room
    io.to(message.roomId).emit('message:receive', message)

    console.log(`Message sent in room ${message.roomId}: ${message.content.substring(0, 50)}...`)
  })

  // Typing indicators
  socket.on('typing:start', (roomId, userAddress) => {
    socket.to(roomId).emit('typing:start', roomId, userAddress)
  })

  socket.on('typing:stop', (roomId, userAddress) => {
    socket.to(roomId).emit('typing:stop', roomId, userAddress)
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)

    if (socket.userAddress) {
      // Update user status
      const user = users.get(socket.userAddress)
      if (user) {
        user.isOnline = false
        user.lastSeen = Date.now()
      }

      // Notify all rooms the user was in
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user:leave', socket.userAddress)
      }
    }
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    rooms: rooms.size,
    users: users.size
  })
})

// Get room info
app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId)
  if (room) {
    res.json({
      id: room.id,
      memberCount: room.members.size,
      messageCount: (messages.get(room.id) || []).length
    })
  } else {
    res.status(404).json({ error: 'Room not found' })
  }
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Web3 Chat Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...')
  server.close(() => {
    console.log('Server stopped')
  })
})
