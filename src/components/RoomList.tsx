'use client'

import { useState } from 'react'
import { Plus, Hash, Shield, Lock, Users } from 'lucide-react'
import { cn, formatTimestamp } from '@/lib/utils'
import type { Room } from '@/types'

interface RoomListProps {
  rooms: Room[]
  currentRoom?: Room
  onRoomSelect: (room: Room) => void
  onCreateRoom: () => void
  userAddress?: string
}

export function RoomList({ 
  rooms, 
  currentRoom, 
  onRoomSelect, 
  onCreateRoom,
  userAddress 
}: RoomListProps) {
  const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'token-gated'>('all')

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true
    if (filter === 'public') return !room.isPrivate && !room.isTokenGated
    if (filter === 'private') return room.isPrivate
    if (filter === 'token-gated') return room.isTokenGated
    return true
  })

  const canAccessRoom = (room: Room): boolean => {
    if (!userAddress) return false
    
    // Public rooms are accessible to everyone
    if (!room.isPrivate && !room.isTokenGated) return true
    
    // Private rooms require membership
    if (room.isPrivate) return room.members.includes(userAddress)
    
    // Token-gated rooms require token ownership (simplified check)
    // In a real implementation, you'd check on-chain token/NFT ownership
    if (room.isTokenGated) return room.members.includes(userAddress)
    
    return false
  }

  const getRoomIcon = (room: Room) => {
    if (room.isTokenGated) return <Shield className="w-4 h-4 text-yellow-500" />
    if (room.isPrivate) return <Lock className="w-4 h-4 text-gray-500" />
    return <Hash className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Rooms</h2>
          <button
            onClick={onCreateRoom}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Filter buttons */}
        <div className="flex gap-1">
          {(['all', 'public', 'private', 'token-gated'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                filter === filterType
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-200"
              )}
            >
              {filterType === 'token-gated' ? 'Token' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Hash className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No rooms found</p>
            <p className="text-xs mt-1">Create a new room to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredRooms.map((room) => {
              const isSelected = currentRoom?.id === room.id
              const canAccess = canAccessRoom(room)
              
              return (
                <button
                  key={room.id}
                  onClick={() => canAccess && onRoomSelect(room)}
                  disabled={!canAccess}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors mb-1",
                    isSelected
                      ? "bg-blue-100 text-blue-900"
                      : canAccess
                      ? "hover:bg-gray-200 text-gray-900"
                      : "text-gray-400 cursor-not-allowed opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getRoomIcon(room)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{room.name}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{room.members.length}</span>
                        </div>
                      </div>
                      {room.description && (
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {room.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(room.lastActivity)}
                      </p>
                    </div>
                  </div>
                  
                  {!canAccess && (
                    <div className="mt-2 text-xs text-red-500">
                      {room.isTokenGated ? 'Token required' : 'Private room'}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
