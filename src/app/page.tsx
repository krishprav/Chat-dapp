'use client'

import { useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { ChatHeader } from '@/components/ChatHeader'
import { RoomList } from '@/components/RoomList'
import { MessageList } from '@/components/MessageList'
import { MessageInput } from '@/components/MessageInput'
import { CreateRoomModal } from '@/components/CreateRoomModal'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { ConfigChecker } from '@/components/ConfigChecker'
import { useSocket } from '@/hooks/useSocket'
import { useChatStore } from '@/hooks/useChatStore'
import { generateRoomId } from '@/lib/utils'
import { ipfsService } from '@/lib/ipfs'
import { encryptionService } from '@/lib/encryption'
import type { Message, Room, User } from '@/types'

export default function ChatRoomPage() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | undefined>()
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const chatStore = useChatStore()
  const socket = useSocket()

  // Initialize with some demo rooms
  useEffect(() => {
    const demoRooms: Room[] = [
      {
        id: 'general',
        name: 'General Discussion',
        description: 'Open chat for everyone',
        isPrivate: false,
        isTokenGated: false,
        creator: '0x0000000000000000000000000000000000000000',
        members: [],
        admins: [],
        createdAt: Date.now() - 86400000,
        lastActivity: Date.now(),
      },
      {
        id: 'defi',
        name: 'DeFi Discussions',
        description: 'Talk about decentralized finance',
        isPrivate: false,
        isTokenGated: false,
        creator: '0x0000000000000000000000000000000000000000',
        members: [],
        admins: [],
        createdAt: Date.now() - 43200000,
        lastActivity: Date.now() - 3600000,
      },
      {
        id: 'vip',
        name: 'VIP Lounge',
        description: 'Exclusive chat for token holders',
        isPrivate: false,
        isTokenGated: true,
        tokenAddress: '0x1234567890123456789012345678901234567890',
        tokenAmount: '100',
        creator: '0x0000000000000000000000000000000000000000',
        members: [],
        admins: [],
        createdAt: Date.now() - 21600000,
        lastActivity: Date.now() - 1800000,
      },
    ]

    chatStore.setRooms(demoRooms)
    if (!chatStore.currentRoom) {
      chatStore.setCurrentRoom(demoRooms[0])
    }
  }, [])

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address) {
      const user: User = {
        address,
        isOnline: true,
      }
      chatStore.setCurrentUser(user)
      chatStore.setAuthenticated(true)

      // Authenticate with socket server
      if (socket.isConnected) {
        authenticateWithServer()
      }
    } else {
      chatStore.setAuthenticated(false)
      chatStore.setCurrentUser(undefined)
    }
  }, [isConnected, address, socket.isConnected])

  // Socket event handlers
  useEffect(() => {
    if (!socket.socket) return

    socket.on('message:receive', (message: Message) => {
      chatStore.addMessage(message)
    })

    socket.on('user:join', (user: User) => {
      chatStore.updateUser(user)
    })

    socket.on('user:leave', (userAddress: string) => {
      const user = chatStore.getUser(userAddress)
      if (user) {
        chatStore.updateUser({ ...user, isOnline: false })
      }
    })

    socket.on('room:update', (room: Room) => {
      chatStore.updateRoom(room)
    })

    socket.on('typing:start', (roomId: string, userAddress: string) => {
      if (roomId === chatStore.currentRoom?.id && userAddress !== address) {
        setTypingUsers(prev => new Set(prev).add(userAddress))
      }
    })

    socket.on('typing:stop', (roomId: string, userAddress: string) => {
      if (roomId === chatStore.currentRoom?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userAddress)
          return newSet
        })
      }
    })

    return () => {
      socket.off('message:receive')
      socket.off('user:join')
      socket.off('user:leave')
      socket.off('room:update')
      socket.off('typing:start')
      socket.off('typing:stop')
    }
  }, [socket.socket, chatStore.currentRoom?.id, address])

  const authenticateWithServer = async () => {
    if (!address) return

    try {
      const message = `Authenticate for Web3 Chat Room: ${Date.now()}`
      const signature = await signMessageAsync({ message })
      socket.authenticateUser(address, signature)
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  const handleRoomSelect = (room: Room) => {
    if (chatStore.currentRoom?.id !== room.id) {
      // Leave current room
      if (chatStore.currentRoom && address) {
        socket.leaveRoom(chatStore.currentRoom.id, address)
      }

      // Join new room
      chatStore.setCurrentRoom(room)
      if (address) {
        socket.joinRoom(room.id, address)
      }

      // Clear typing state
      setTypingUsers(new Set())
      setReplyingTo(undefined)
    }
  }

  const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text', replyTo?: string) => {
    if (!address || !chatStore.currentRoom) return

    try {
      let finalContent = content
      let encrypted = false

      // Encrypt message if room supports encryption
      if (chatStore.currentRoom.encryptionKey) {
        const keyPair = encryptionService.getKeyPair(chatStore.currentRoom.id)
        if (keyPair) {
          finalContent = await encryptionService.encryptMessage(content, keyPair.publicKey)
          encrypted = true
        }
      }

      const message: Omit<Message, 'id' | 'timestamp'> = {
        content: finalContent,
        sender: address,
        roomId: chatStore.currentRoom.id,
        type,
        encrypted,
        replyTo,
      }

      // Store to IPFS
      try {
        const ipfsHash = await ipfsService.storeMessage(message)
        socket.sendMessage({ ...message, ipfsHash })
      } catch (error) {
        console.error('IPFS storage failed, sending without hash:', error)
        socket.sendMessage(message)
      }

      // Clear reply state
      setReplyingTo(undefined)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleCreateRoom = async (roomData: any) => {
    if (!address) return

    const room: Room = {
      id: generateRoomId(),
      ...roomData,
      creator: address,
      members: [address],
      admins: [address],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    }

    // Generate encryption keys for the room
    if (roomData.isPrivate || roomData.isTokenGated) {
      try {
        const keyPair = await encryptionService.generateKeyPair()
        encryptionService.storeKeyPair(room.id, keyPair)
        room.encryptionKey = keyPair.publicKey
      } catch (error) {
        console.error('Failed to generate encryption keys:', error)
      }
    }

    chatStore.addRoom(room)
    
    // Emit room creation to server
    socket.emit('room:create', room)
  }

  const handleTyping = (isTyping: boolean) => {
    if (!address || !chatStore.currentRoom) return

    if (isTyping) {
      socket.startTyping(chatStore.currentRoom.id, address)
    } else {
      socket.stopTyping(chatStore.currentRoom.id, address)
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const handleTip = (message: Message) => {
    // TODO: Implement tipping functionality
    console.log('Tip message:', message)
  }

  const getOnlineCount = (): number => {
    return Object.values(chatStore.users).filter(user => user.isOnline).length
  }

  const currentMessages = chatStore.currentRoom 
    ? chatStore.getRoomMessages(chatStore.currentRoom.id)
    : []

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Web3 Chat Room</h1>
          <p className="text-gray-600 mb-8">Connect your wallet to join the conversation</p>
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ChatHeader
        currentRoom={chatStore.currentRoom}
        onlineCount={getOnlineCount()}
        onSettingsClick={() => console.log('Settings clicked')}
      />

      <div className="flex-1 flex overflow-hidden">
        <RoomList
          rooms={chatStore.rooms}
          currentRoom={chatStore.currentRoom}
          onRoomSelect={handleRoomSelect}
          onCreateRoom={() => setIsCreateRoomModalOpen(true)}
          userAddress={address}
        />

        <div className="flex-1 flex flex-col">
          <MessageList
            messages={currentMessages}
            users={chatStore.users}
            currentUserAddress={address}
            onReply={handleReply}
            onTip={handleTip}
          />

          {/* Typing indicators */}
          {typingUsers.size > 0 && (
            <div className="px-4 py-2 text-sm text-gray-500">
              {Array.from(typingUsers).map(userAddress => {
                const user = chatStore.getUser(userAddress)
                return user?.ensName || `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
              }).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            disabled={!chatStore.isAuthenticated || !socket.isConnected}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(undefined)}
            placeholder={
              !chatStore.isAuthenticated 
                ? "Please authenticate to send messages..."
                : !socket.isConnected
                ? "Connecting to chat server..."
                : `Message ${chatStore.currentRoom?.name || 'room'}`
            }
          />
        </div>
      </div>

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
      
      <ConfigChecker />
    </div>
  )
}
