import { ethers } from 'ethers'

export class EncryptionService {
  private static instance: EncryptionService
  private keyPairs: Map<string, { publicKey: string; privateKey: string }> = new Map()

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService()
    }
    return EncryptionService.instance
  }

  // Generate a key pair for encryption
  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    // For simplicity, we'll use a basic implementation
    // In production, use more robust encryption like libsodium or Signal Protocol
    const wallet = ethers.Wallet.createRandom()
    
    return {
      publicKey: wallet.address,
      privateKey: wallet.privateKey,
    }
  }

  // Store key pair for a room
  storeKeyPair(roomId: string, keyPair: { publicKey: string; privateKey: string }) {
    this.keyPairs.set(roomId, keyPair)
    
    // Store in localStorage for persistence (in production, use secure storage)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chatroom_keys_${roomId}`, JSON.stringify(keyPair))
    }
  }

  // Get key pair for a room
  getKeyPair(roomId: string): { publicKey: string; privateKey: string } | null {
    let keyPair = this.keyPairs.get(roomId)
    
    if (!keyPair && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`chatroom_keys_${roomId}`)
      if (stored) {
        keyPair = JSON.parse(stored)
        if (keyPair) {
          this.keyPairs.set(roomId, keyPair)
        }
      }
    }
    
    return keyPair || null
  }

  // Encrypt message content
  async encryptMessage(content: string, publicKey: string): Promise<string> {
    try {
      // Simple XOR encryption for demo purposes
      // In production, use proper encryption like AES-GCM
      const key = this.stringToKey(publicKey)
      const encrypted = this.xorEncrypt(content, key)
      return btoa(encrypted) // Base64 encode
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt message')
    }
  }

  // Decrypt message content
  async decryptMessage(encryptedContent: string, privateKey: string): Promise<string> {
    try {
      const key = this.stringToKey(privateKey)
      const decoded = atob(encryptedContent) // Base64 decode
      return this.xorEncrypt(decoded, key) // XOR is symmetric
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt message')
    }
  }

  // Sign message for integrity
  async signMessage(content: string, privateKey: string): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey)
      const message = ethers.hashMessage(content)
      return await wallet.signMessage(content)
    } catch (error) {
      console.error('Signing failed:', error)
      throw new Error('Failed to sign message')
    }
  }

  // Verify message signature
  async verifySignature(content: string, signature: string, address: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(content, signature)
      return recoveredAddress.toLowerCase() === address.toLowerCase()
    } catch (error) {
      console.error('Signature verification failed:', error)
      return false
    }
  }

  // Helper methods
  private stringToKey(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff
    }
    return hash.toString(36)
  }

  private xorEncrypt(text: string, key: string): string {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }
    return result
  }

  // Clean up stored keys
  clearKeys() {
    this.keyPairs.clear()
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('chatroom_keys_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }
}

export const encryptionService = EncryptionService.getInstance()
