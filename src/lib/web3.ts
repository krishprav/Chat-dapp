import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { env } from './env'

export const config = getDefaultConfig({
  appName: 'Web3 Chat Room',
  projectId: env.walletConnectProjectId,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
})

export const SUPPORTED_CHAINS = [mainnet, polygon, optimism, arbitrum, base]

// IPFS Configuration
export const IPFS_CONFIG = {
  apiUrl: env.ipfsApiUrl,
  gateway: 'https://ipfs.io/ipfs/',
  auth: env.ipfsAuth,
}

// Contract addresses (these would be deployed contracts)
export const CONTRACTS = {
  CHAT_ROOM_FACTORY: {
    [mainnet.id]: '0x0000000000000000000000000000000000000000',
    [polygon.id]: '0x0000000000000000000000000000000000000000',
  },
  TIPPING_CONTRACT: {
    [mainnet.id]: '0x0000000000000000000000000000000000000000',
    [polygon.id]: '0x0000000000000000000000000000000000000000',
  },
}

export const DEFAULT_ROOM_CONFIG = {
  maxMembers: 1000,
  messageRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
  enableEncryption: true,
  enableTipping: true,
}
