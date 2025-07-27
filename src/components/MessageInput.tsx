'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, X, Reply } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image', replyTo?: string) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
  replyingTo?: Message
  onCancelReply?: () => void
  placeholder?: string
}

export function MessageInput({ 
  onSendMessage, 
  onTyping,
  disabled,
  replyingTo,
  onCancelReply,
  placeholder = "Type a message..."
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    // Handle typing indicator
    if (onTyping) {
      if (!isTyping && value.length > 0) {
        setIsTyping(true)
        onTyping(true)
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        onTyping(false)
      }, 1000)
    }

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || disabled) return

    onSendMessage(message.trim(), 'text', replyingTo?.id)
    setMessage('')
    
    // Reset typing state
    if (isTyping && onTyping) {
      setIsTyping(false)
      onTyping(false)
    }

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Handle file upload (for now, just log)
      console.log('File selected:', file)
      // In a real implementation, you'd upload to IPFS and send the hash
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Reply preview */}
      {replyingTo && (
        <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Reply className="w-4 h-4" />
              <span>Replying to message</span>
            </div>
            <button
              onClick={onCancelReply}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-800 bg-white border border-gray-200 rounded p-2">
            {replyingTo.content}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* File upload button */}
        <div className="flex-shrink-0">
          <label className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <Paperclip className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={disabled}
            />
          </label>
        </div>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              disabled && "opacity-50 cursor-not-allowed",
              "min-h-[48px] max-h-32"
            )}
          />
          
          {/* Emoji button */}
          <button
            type="button"
            className="absolute right-3 bottom-3 p-1 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={disabled}
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        {/* Send button */}
        <div className="flex-shrink-0">
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={cn(
              "p-3 rounded-lg font-medium transition-colors",
              message.trim() && !disabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Character count (optional) */}
      {message.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          {message.length}/2000
        </div>
      )}
    </div>
  )
}
