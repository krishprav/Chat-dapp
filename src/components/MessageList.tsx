'use client'

import { useEffect, useRef } from 'react'
import { Shield, Reply, Coins, ExternalLink } from 'lucide-react'
import { cn, truncateAddress, formatTimestamp } from '@/lib/utils'
import type { Message, User } from '@/types'

interface MessageListProps {
  messages: Message[]
  users: { [address: string]: User }
  currentUserAddress?: string
  onReply?: (message: Message) => void
  onTip?: (message: Message) => void
}

export function MessageList({ 
  messages, 
  users, 
  currentUserAddress,
  onReply,
  onTip 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getUser = (address: string): User => {
    return users[address] || {
      address,
      isOnline: false,
    }
  }

  const isOwnMessage = (message: Message): boolean => {
    return currentUserAddress === message.sender
  }

  const renderMessageContent = (message: Message) => {
    if (message.type === 'tip') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <Coins className="w-4 h-4" />
            <span className="font-medium">
              Sent {message.tipAmount} {message.tipToken || 'ETH'}
            </span>
          </div>
          {message.content && (
            <p className="text-sm text-gray-700 mt-1">{message.content}</p>
          )}
        </div>
      )
    }

    if (message.type === 'image') {
      return (
        <div className="max-w-md">
          <img 
            src={message.content} 
            alt="Shared image" 
            className="rounded-lg max-w-full h-auto"
          />
        </div>
      )
    }

    return (
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {message.encrypted && (
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <Shield className="w-3 h-3" />
            <span>Encrypted</span>
          </div>
        )}
      </div>
    )
  }

  const renderReplyPreview = (message: Message) => {
    if (!message.replyTo) return null
    
    const replyToMessage = messages.find(m => m.id === message.replyTo)
    if (!replyToMessage) return null
    
    const replyUser = getUser(replyToMessage.sender)
    
    return (
      <div className="bg-gray-100 border-l-2 border-gray-300 pl-3 py-2 mb-2 rounded">
        <div className="text-xs text-gray-600 mb-1">
          Replying to {replyUser.ensName || truncateAddress(replyUser.address)}
        </div>
        <div className="text-sm text-gray-800 truncate">
          {replyToMessage.content}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Reply className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-sm">Start the conversation by sending a message!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const user = getUser(message.sender)
        const isOwn = isOwnMessage(message)
        const showAvatar = index === 0 || messages[index - 1].sender !== message.sender
        
        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              isOwn ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {showAvatar ? (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.ensName 
                    ? user.ensName.charAt(0).toUpperCase()
                    : user.address.slice(2, 4).toUpperCase()
                  }
                </div>
              ) : (
                <div className="w-8 h-8" />
              )}
            </div>

            {/* Message */}
            <div className={cn("flex-1 max-w-2xl", isOwn && "flex flex-col items-end")}>
              {showAvatar && (
                <div className={cn(
                  "flex items-center gap-2 mb-1",
                  isOwn && "flex-row-reverse"
                )}>
                  <span className="text-sm font-medium text-gray-900">
                    {user.ensName || truncateAddress(user.address)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {user.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              )}

              <div className={cn(
                "group relative",
                isOwn ? "text-right" : "text-left"
              )}>
                {renderReplyPreview(message)}
                
                <div className={cn(
                  "inline-block p-3 rounded-lg max-w-full",
                  isOwn
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                )}>
                  {renderMessageContent(message)}
                </div>

                {/* Message actions */}
                {!isOwn && (
                  <div className="absolute top-0 -right-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex bg-white border border-gray-200 rounded-lg shadow-lg">
                      {onReply && (
                        <button
                          onClick={() => onReply(message)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-l-lg"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      )}
                      {onTip && (
                        <button
                          onClick={() => onTip(message)}
                          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-r-lg"
                          title="Send tip"
                        >
                          <Coins className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* IPFS link */}
                {message.ipfsHash && (
                  <div className="mt-1">
                    <a
                      href={`https://ipfs.io/ipfs/${message.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View on IPFS
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
