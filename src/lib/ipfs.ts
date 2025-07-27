import { env } from './env'
import type { Message } from '@/types'

interface IPFSUploadResponse {
  Name: string
  Hash: string
  Size: string
}

class IPFSService {
  private baseUrl: string
  private headers: Record<string, string>

  constructor() {
    // Use public IPFS gateway for demo, or configure with your own
    this.baseUrl = env.ipfsApiUrl
    this.headers = {
      'Content-Type': 'application/json',
    }

    // Add auth if provided
    if (env.ipfsAuth) {
      this.headers['Authorization'] = `Basic ${env.ipfsAuth}`
    }
  }

  async storeMessage(message: Omit<Message, 'ipfsHash'>): Promise<string> {
    try {
      const messageData = {
        ...message,
        storedAt: Date.now(),
      }

      // For demo purposes, we'll simulate IPFS storage
      // In production, you'd upload to a real IPFS node
      const mockHash = this.generateMockHash(JSON.stringify(messageData))
      
      // Store in localStorage for demo (in production, this would be actual IPFS)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ipfs_${mockHash}`, JSON.stringify(messageData))
      }

      console.log('Message stored to IPFS (simulated):', mockHash)
      return mockHash
    } catch (error) {
      console.error('Error storing message to IPFS:', error)
      throw new Error('Failed to store message')
    }
  }

  async retrieveMessage(hash: string): Promise<Message | null> {
    try {
      // For demo purposes, retrieve from localStorage
      // In production, this would fetch from IPFS
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`ipfs_${hash}`)
        if (stored) {
          return JSON.parse(stored)
        }
      }

      // If not found locally, try to fetch from public gateway
      try {
        const response = await fetch(`https://ipfs.io/ipfs/${hash}`)
        if (response.ok) {
          return await response.json()
        }
      } catch (fetchError) {
        console.warn('Could not fetch from IPFS gateway:', fetchError)
      }

      return null
    } catch (error) {
      console.error('Error retrieving message from IPFS:', error)
      return null
    }
  }

  async storeRoomMetadata(room: any): Promise<string> {
    try {
      const mockHash = this.generateMockHash(JSON.stringify(room))
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ipfs_room_${mockHash}`, JSON.stringify(room))
      }

      console.log('Room metadata stored to IPFS (simulated):', mockHash)
      return mockHash
    } catch (error) {
      console.error('Error storing room metadata to IPFS:', error)
      throw new Error('Failed to store room metadata')
    }
  }

  async retrieveRoomMetadata(hash: string): Promise<any | null> {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`ipfs_room_${hash}`)
        if (stored) {
          return JSON.parse(stored)
        }
      }

      return null
    } catch (error) {
      console.error('Error retrieving room metadata from IPFS:', error)
      return null
    }
  }

  async storeEncryptedData(data: any): Promise<string> {
    try {
      const mockHash = this.generateMockHash(JSON.stringify(data))
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ipfs_encrypted_${mockHash}`, JSON.stringify(data))
      }

      console.log('Encrypted data stored to IPFS (simulated):', mockHash)
      return mockHash
    } catch (error) {
      console.error('Error storing encrypted data to IPFS:', error)
      throw new Error('Failed to store encrypted data')
    }
  }

  getIPFSUrl(hash: string): string {
    return `https://ipfs.io/ipfs/${hash}`
  }

  // Real IPFS upload method (for when you have a proper IPFS endpoint)
  async uploadToIPFS(data: string | object): Promise<string> {
    try {
      const formData = new FormData()
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], {
        type: 'application/json'
      })
      formData.append('file', blob)

      const response = await fetch(`${this.baseUrl}/api/v0/add`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': undefined as any, // Let browser set boundary for FormData
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`)
      }

      const result: IPFSUploadResponse = await response.json()
      return result.Hash
    } catch (error) {
      console.error('IPFS upload error:', error)
      // Fallback to mock storage
      return this.storeMessage(data as any)
    }
  }

  // Generate a mock IPFS hash for demo purposes
  private generateMockHash(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Convert to base58-like string to mimic IPFS hash format
    const mockHash = 'Qm' + Math.abs(hash).toString(36) + Date.now().toString(36)
    return mockHash.substring(0, 46) // IPFS hashes are typically 46 characters
  }

  // Clean up stored data (for development)
  clearLocalStorage() {
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('ipfs_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // Get storage statistics
  getStorageStats() {
    if (typeof window === 'undefined') return { count: 0, size: 0 }

    let count = 0
    let size = 0

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ipfs_')) {
        count++
        size += localStorage.getItem(key)?.length || 0
      }
    })

    return { count, size }
  }
}

export const ipfsService = new IPFSService()
