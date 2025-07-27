// This file extends the global namespace to include our environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?: string
      NEXT_PUBLIC_IPFS_API_URL?: string
      NEXT_PUBLIC_IPFS_AUTH?: string
      NEXT_PUBLIC_WEBSOCKET_URL?: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

export {}
