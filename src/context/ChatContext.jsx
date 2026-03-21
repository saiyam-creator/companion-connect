import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { db, collection, query, orderBy, limit, onSnapshot } from '../utils/firebase'
import { getMyActivities, getJoinedActivities } from '../utils/db'
import { useAuth } from './AuthContext'
import { useLocation } from 'react-router-dom'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const [unreadMsgCount, setUnreadMsgCount] = useState(0)
  const [chatMeta, setChatMeta] = useState({})
  const unsubsRef = useRef({})       // { activityId: unsubFn }
  const readChatsRef = useRef(new Set())
  const subscribedIds = useRef(new Set())

  // Subscribe to a single chat's last message
  const subscribeToChat = useCallback((chat, myId) => {
    if (subscribedIds.current.has(chat.id)) return // already listening
    subscribedIds.current.add(chat.id)

    const q = query(
      collection(db, 'activities', chat.id, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const unsub = onSnapshot(q, (snap) => {
      const lastDoc = snap.docs[0]
      if (!lastDoc) return

      const msg = { id: lastDoc.id, ...lastDoc.data() }
      const isFromOther = (msg.senderId || '') !== myId
      const isViewingThisChat = readChatsRef.current.has(chat.id)

      setChatMeta(prev => {
        const prevMeta = prev[chat.id] || {}
        const isNewMsg = msg.id !== prevMeta.lastMsgId
        const newUnread = (isNewMsg && isFromOther && !isViewingThisChat)
          ? (prevMeta.unread || 0) + 1
          : (prevMeta.unread || 0)

        return {
          ...prev,
          [chat.id]: {
            unread: newUnread,
            lastMsgId: msg.id,
            lastMsg: msg,
            activityTitle: chat.title,
          }
        }
      })
    }, () => {
      // On error, remove from subscribed so it can retry
      subscribedIds.current.delete(chat.id)
    })

    unsubsRef.current[chat.id] = unsub
  }, [])

  // Load all chats and subscribe
  const setupListeners = useCallback(async () => {
    if (!user?.uid) return
    try {
      const [created, joined] = await Promise.all([
        getMyActivities(user.uid),
        getJoinedActivities(user.uid),
      ])
      const createdWithMembers = created.filter(a =>
        (a.joinRequests || []).some(r => r.status === 'accepted')
      )
      const seen = new Set()
      const allChats = []
      ;[...createdWithMembers, ...joined].forEach(a => {
        if (!seen.has(a.id)) { seen.add(a.id); allChats.push(a) }
      })
      allChats.forEach(chat => subscribeToChat(chat, user.uid))
    } catch (e) {
      console.error('ChatContext setup error:', e)
    }
  }, [user?.uid, subscribeToChat])

  // Initial setup
  useEffect(() => {
    if (!user?.uid) {
      // Cleanup all
      Object.values(unsubsRef.current).forEach(u => u())
      unsubsRef.current = {}
      subscribedIds.current.clear()
      setChatMeta({})
      return
    }
    setupListeners()
  }, [user?.uid, setupListeners])

  // Re-run setup when user navigates (to pick up newly joined chats)
  useEffect(() => {
    if (user?.uid) setupListeners()
  }, [location.pathname])

  // Total unread count
  useEffect(() => {
    const total = Object.values(chatMeta).reduce((s, v) => s + (v.unread || 0), 0)
    setUnreadMsgCount(total)
  }, [chatMeta])

  // Mark chat as read when user enters chat page
  useEffect(() => {
    const match = location.pathname.match(/\/activity\/([^/]+)\/chat/)
    if (match) {
      const actId = match[1]
      readChatsRef.current.add(actId)
      setChatMeta(prev => ({
        ...prev,
        [actId]: { ...(prev[actId] || {}), unread: 0 }
      }))
    } else {
      readChatsRef.current.clear()
    }
  }, [location.pathname])

  const markChatRead = useCallback((activityId) => {
    readChatsRef.current.add(activityId)
    setChatMeta(prev => ({
      ...prev,
      [activityId]: { ...(prev[activityId] || {}), unread: 0 }
    }))
  }, [])

  // Expose refreshChats so pages can call after joining a new activity
  const refreshChats = useCallback(() => {
    if (user?.uid) setupListeners()
  }, [user?.uid, setupListeners])

  return (
    <ChatContext.Provider value={{ unreadMsgCount, chatMeta, markChatRead, refreshChats }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => useContext(ChatContext)
