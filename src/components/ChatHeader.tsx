'use client'

import { Users, Settings, Shield, Hash } from 'lucide-react'
import { WalletConnectButton } from './WalletConnectButton'
import type { Room } from '@/types'

interface ChatHeaderProps {
  currentRoom?: Room
  onlineCount: number
  onSettingsClick: () => void
}

export function ChatHeader({ currentRoom, onlineCount, onSettingsClick }: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {currentRoom?.isTokenGated ? (
              <Shield className="w-5 h-5 text-yellow-500" />
            ) : (
              <Hash className="w-5 h-5 text-gray-500" />
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              {currentRoom?.name || 'Web3 Chat Room'}
            </h1>
          </div>
          
          {currentRoom?.description && (
            <p className="text-sm text-gray-600">{currentRoom.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{onlineCount} online</span>
          </div>
          
          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <WalletConnectButton />
        </div>
      </div>
    </div>
  )
}
