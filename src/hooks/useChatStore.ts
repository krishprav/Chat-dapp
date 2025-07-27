import { useReducer, useCallback } from 'react'
import type { ChatState, Message, Room, User } from '@/types'

type ChatAction =
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'SET_CURRENT_ROOM'; payload: Room }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_MESSAGES'; payload: { roomId: string; messages: Message[] } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'RESET_STATE' }

const initialState: ChatState = {
  rooms: [],
  messages: {},
  users: {},
  isConnected: false,
  isAuthenticated: false,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload }

    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload,
        users: { ...state.users, [action.payload.address]: action.payload },
      }

    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }

    case 'ADD_ROOM':
      return {
        ...state,
        rooms: [...state.rooms.filter(r => r.id !== action.payload.id), action.payload],
      }

    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room => 
          room.id === action.payload.id ? action.payload : room
        ),
        currentRoom: state.currentRoom?.id === action.payload.id ? action.payload : state.currentRoom,
      }

    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload }

    case 'ADD_MESSAGE':
      const roomId = action.payload.roomId
      const existingMessages = state.messages[roomId] || []
      return {
        ...state,
        messages: {
          ...state.messages,
          [roomId]: [...existingMessages, action.payload].sort((a, b) => a.timestamp - b.timestamp),
        },
      }

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: action.payload.messages,
        },
      }

    case 'UPDATE_USER':
      return {
        ...state,
        users: { ...state.users, [action.payload.address]: action.payload },
      }

    case 'REMOVE_USER':
      const { [action.payload]: removed, ...remainingUsers } = state.users
      return { ...state, users: remainingUsers }

    case 'SET_ROOMS':
      return { ...state, rooms: action.payload }

    case 'RESET_STATE':
      return initialState

    default:
      return state
  }
}

export function useChatStore() {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const setAuthenticated = useCallback((authenticated: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: authenticated })
  }, [])

  const setCurrentUser = useCallback((user: User) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user })
  }, [])

  const setConnected = useCallback((connected: boolean) => {
    dispatch({ type: 'SET_CONNECTED', payload: connected })
  }, [])

  const addRoom = useCallback((room: Room) => {
    dispatch({ type: 'ADD_ROOM', payload: room })
  }, [])

  const updateRoom = useCallback((room: Room) => {
    dispatch({ type: 'UPDATE_ROOM', payload: room })
  }, [])

  const setCurrentRoom = useCallback((room: Room) => {
    dispatch({ type: 'SET_CURRENT_ROOM', payload: room })
  }, [])

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message })
  }, [])

  const setMessages = useCallback((roomId: string, messages: Message[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: { roomId, messages } })
  }, [])

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user })
  }, [])

  const removeUser = useCallback((address: string) => {
    dispatch({ type: 'REMOVE_USER', payload: address })
  }, [])

  const setRooms = useCallback((rooms: Room[]) => {
    dispatch({ type: 'SET_ROOMS', payload: rooms })
  }, [])

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
  }, [])

  const getRoomMessages = useCallback((roomId: string) => {
    return state.messages[roomId] || []
  }, [state.messages])

  const getUser = useCallback((address: string) => {
    return state.users[address]
  }, [state.users])

  return {
    ...state,
    setAuthenticated,
    setCurrentUser,
    setConnected,
    addRoom,
    updateRoom,
    setCurrentRoom,
    addMessage,
    setMessages,
    updateUser,
    removeUser,
    setRooms,
    resetState,
    getRoomMessages,
    getUser,
  }
}
