// Environment configuration helper
export const env = {
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  ipfsApiUrl: process.env.NEXT_PUBLIC_IPFS_API_URL || 'https://ipfs.infura.io:5001',
  ipfsAuth: process.env.NEXT_PUBLIC_IPFS_AUTH || '',
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

// Validation helper
export function validateEnvironment() {
  const issues: string[] = []

  if (!env.walletConnectProjectId || env.walletConnectProjectId === 'demo-project-id') {
    issues.push('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not configured')
  }

  if (!env.websocketUrl) {
    issues.push('NEXT_PUBLIC_WEBSOCKET_URL not configured')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

// Helper to check if we're running in a browser environment
export const isBrowser = typeof window !== 'undefined'
