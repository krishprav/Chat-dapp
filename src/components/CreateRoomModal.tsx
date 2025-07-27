'use client'

import { useState } from 'react'
import { X, Hash, Lock, Shield, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateRoom: (roomData: {
    name: string
    description: string
    isPrivate: boolean
    isTokenGated: boolean
    tokenAddress?: string
    tokenAmount?: string
    nftCollectionAddress?: string
  }) => void
}

export function CreateRoomModal({ isOpen, onClose, onCreateRoom }: CreateRoomModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    isTokenGated: false,
    tokenAddress: '',
    tokenAmount: '',
    nftCollectionAddress: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required'
    }

    if (formData.isTokenGated) {
      if (!formData.tokenAddress && !formData.nftCollectionAddress) {
        newErrors.token = 'Token address or NFT collection address is required'
      }
      if (formData.tokenAddress && !formData.tokenAmount) {
        newErrors.tokenAmount = 'Token amount is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onCreateRoom(formData)
      onClose()
      setFormData({
        name: '',
        description: '',
        isPrivate: false,
        isTokenGated: false,
        tokenAddress: '',
        tokenAmount: '',
        nftCollectionAddress: '',
      })
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Room</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.name ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Enter room name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional room description"
              rows={3}
            />
          </div>

          {/* Room Type Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Room Type
            </label>

            {/* Public Room */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="roomType"
                checked={!formData.isPrivate && !formData.isTokenGated}
                onChange={() => {
                  handleInputChange('isPrivate', false)
                  handleInputChange('isTokenGated', false)
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Public Room</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Anyone can join and participate
                </p>
              </div>
            </label>

            {/* Private Room */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="roomType"
                checked={formData.isPrivate && !formData.isTokenGated}
                onChange={() => {
                  handleInputChange('isPrivate', true)
                  handleInputChange('isTokenGated', false)
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Private Room</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Invite-only access
                </p>
              </div>
            </label>

            {/* Token-Gated Room */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="roomType"
                checked={formData.isTokenGated}
                onChange={() => {
                  handleInputChange('isPrivate', false)
                  handleInputChange('isTokenGated', true)
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Token-Gated Room</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Requires token or NFT ownership
                </p>
              </div>
            </label>
          </div>

          {/* Token-Gated Options */}
          {formData.isTokenGated && (
            <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  Specify either a token requirement OR an NFT collection requirement
                </p>
              </div>

              {/* Token Requirements */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Token Requirement</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Address
                    </label>
                    <input
                      type="text"
                      value={formData.tokenAddress}
                      onChange={(e) => handleInputChange('tokenAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Amount
                    </label>
                    <input
                      type="text"
                      value={formData.tokenAmount}
                      onChange={(e) => handleInputChange('tokenAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="1.0"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                OR
              </div>

              {/* NFT Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NFT Collection Address
                </label>
                <input
                  type="text"
                  value={formData.nftCollectionAddress}
                  onChange={(e) => handleInputChange('nftCollectionAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="0x..."
                />
              </div>

              {errors.token && (
                <p className="text-red-500 text-sm">{errors.token}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
