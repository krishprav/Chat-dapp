'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { env, validateEnvironment } from '@/lib/env'

export function ConfigChecker() {
  const [isOpen, setIsOpen] = useState(false)

  const configs = [
    {
      name: 'WalletConnect Project ID',
      value: env.walletConnectProjectId !== 'demo-project-id' ? env.walletConnectProjectId : '',
      required: true,
      description: 'Required for wallet connections'
    },
    {
      name: 'WebSocket URL',
      value: env.websocketUrl,
      required: true,
      description: 'Required for real-time messaging'
    },
    {
      name: 'IPFS API URL',
      value: env.ipfsApiUrl,
      required: false,
      description: 'Optional - for production IPFS integration'
    },
    {
      name: 'IPFS Auth',
      value: env.ipfsAuth,
      required: false,
      description: 'Optional - for authenticated IPFS uploads'
    }
  ]

  const requiredMissing = configs.filter(config => config.required && !config.value).length
  const optionalMissing = configs.filter(config => !config.required && !config.value).length

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors z-50 ${
          requiredMissing > 0 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        title="Configuration Status"
      >
        {requiredMissing > 0 ? (
          <AlertCircle className="w-6 h-6" />
        ) : (
          <CheckCircle className="w-6 h-6" />
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Configuration Status</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {configs.map((config, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              {config.value ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : config.required ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Info className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  config.value ? 'text-gray-900' : config.required ? 'text-red-700' : 'text-gray-500'
                }`}>
                  {config.name}
                </span>
                {config.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-1 rounded">
                    required
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {config.description}
              </p>
              {config.value && (
                <p className="text-xs text-green-600 font-mono mt-1">
                  {config.value.length > 20 ? '***configured***' : config.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {requiredMissing > 0 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <strong>Missing required configuration!</strong> Update your .env.local file to get started.
        </div>
      )}

      {requiredMissing === 0 && optionalMissing > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          Optional configurations missing. The app will work but some features may be limited.
        </div>
      )}

      {requiredMissing === 0 && optionalMissing === 0 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          All configurations are set! You're ready to go.
        </div>
      )}
    </div>
  )
}
