export interface User {
  address: string
  ensName?: string
  avatar?: string
  isOnline: boolean
  lastSeen?: number
}

export interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  roomId: string
  encrypted?: boolean
  ipfsHash?: string
  signature?: string
  replyTo?: string
  type: 'text' | 'image' | 'tip'
  tipAmount?: string
  tipToken?: string
}

export interface Room {
  id: string
  name: string
  description?: string
  isPrivate: boolean
  isTokenGated: boolean
  tokenAddress?: string
  tokenAmount?: string
  nftCollectionAddress?: string
  creator: string
  members: string[]
  admins: string[]
  createdAt: number
  lastActivity: number
  encryptionKey?: string
}

export interface ChatState {
  rooms: Room[]
  currentRoom?: Room
  messages: { [roomId: string]: Message[] }
  users: { [address: string]: User }
  isConnected: boolean
  isAuthenticated: boolean
  currentUser?: User
}

export interface SocketEvents {
  'user:join': (user: User) => void
  'user:leave': (address: string) => void
  'message:send': (message: Omit<Message, 'id' | 'timestamp'>) => void
  'message:receive': (message: Message) => void
  'room:join': (roomId: string, userAddress: string) => void
  'room:leave': (roomId: string, userAddress: string) => void
  'room:create': (room: Omit<Room, 'id' | 'createdAt' | 'lastActivity'>) => void
  'room:update': (room: Room) => void
  'typing:start': (roomId: string, userAddress: string) => void
  'typing:stop': (roomId: string, userAddress: string) => void
}

export interface IPFSConfig {
  host: string
  port: number
  protocol: 'http' | 'https'
}

export interface EncryptionKeyPair {
  publicKey: string
  privateKey: string
}
