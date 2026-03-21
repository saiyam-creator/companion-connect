import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, isToday, isYesterday } from 'date-fns'
import { ArrowLeft, Send, Loader2, CheckSquare, Users, Calendar, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar, Spinner } from '../components/ui/index.jsx'
import { getActivity, sendMessage, subscribeMessages, subscribeActivity, markActivityDone, toDate } from '../utils/db'
import toast from 'react-hot-toast'

const CAT_EMOJI  = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }
const CAT_COLOR  = { Movie:'bg-purple-500/20 text-purple-300 border-purple-500/30',Gym:'bg-green-500/20 text-green-300 border-green-500/30',Travel:'bg-blue-500/20 text-blue-300 border-blue-500/30',Study:'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',Food:'bg-orange-500/20 text-orange-300 border-orange-500/30',Music:'bg-pink-500/20 text-pink-300 border-pink-500/30',Sports:'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',Gaming:'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',Hiking:'bg-lime-500/20 text-lime-300 border-lime-500/30',Other:'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' }

function smartDate(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export default function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activity, setActivity] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [markingDone, setMarkingDone] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const bottomRef = useRef(null)

  // Subscribe to activity (realtime updates for isDone etc)
  useEffect(() => {
    const unsub = subscribeActivity(id, (act) => setActivity(act))
    return unsub
  }, [id])

  // Subscribe to messages (realtime)
  useEffect(() => {
    const unsub = subscribeMessages(id, (msgs) => {
      setMessages(msgs)
      setLoading(false)
    })
    return unsub
  }, [id])

  // Check access
  useEffect(() => {
    if (!activity || !user) return
    const myId = user.uid
    const isCreator = activity.creatorId === myId
    const isAccepted = (activity.joinRequests || []).some(r => r.userId === myId && r.status === 'accepted')
    if (!isCreator && !isAccepted) {
      toast.error('Access denied. Get accepted first.')
      navigate(`/activity/${id}`)
    }
  }, [activity, user, id, navigate])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    const content = input.trim()
    if (!content || sending || activity?.isDone) return
    setInput(''); setSending(true)
    try { await sendMessage(id, user, content) }
    catch { toast.error('Failed to send'); setInput(content) }
    finally { setSending(false) }
  }

  const handleMarkDone = async () => {
    setMarkingDone(true)
    try {
      await markActivityDone(id, !activity.isDone)
      toast.success(activity.isDone ? 'Marked active' : '✅ Activity done!')
    } catch { toast.error('Failed') }
    finally { setMarkingDone(false) }
  }

  if (!activity && loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size={32}/></div>

  const myId = user?.uid || ''
  const isCreator = activity?.creatorId === myId
  const acceptedCount = (activity?.joinRequests || []).filter(r => r.status === 'accepted').length
  const catColor = CAT_COLOR[activity?.category] || CAT_COLOR.Other

  // Group messages by date
  const grouped = []
  let lastDate = null
  messages.forEach(msg => {
    const d = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt || Date.now())
    const dateStr = format(d, 'MMMM d, yyyy')
    if (dateStr !== lastDate) { grouped.push({ type: 'date', date: dateStr }); lastDate = dateStr }
    grouped.push({ type: 'msg', msg })
  })

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Category banner */}
      <div className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold flex items-center gap-2 border-b ${catColor}`}>
        {CAT_EMOJI[activity?.category]} {activity?.category} Group Chat
        {activity?.isDone && <span className="ml-auto">✅ Done</span>}
      </div>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-surface-1 border-b border-surface-3">
        <button onClick={() => navigate(`/activity/${id}`)} className="btn-ghost p-2 -ml-2"><ArrowLeft size={18}/></button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowInfo(p => !p)}>
          <h2 className="font-bold text-sm text-zinc-100 truncate">{activity?.title || '...'}</h2>
          <p className="text-xs text-zinc-500">{activity?.city} · {acceptedCount + 1} members</p>
        </div>
        {isCreator && (
          <button onClick={handleMarkDone} disabled={markingDone}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activity?.isDone ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-surface-2 text-zinc-400 border-surface-3 hover:bg-surface-3'
            }`}>
            {markingDone ? <Spinner size={11}/> : <CheckSquare size={13}/>}
            {activity?.isDone ? 'Done ✓' : 'Mark Done'}
          </button>
        )}
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot"/>
      </div>

      {showInfo && activity && (
        <div className="flex-shrink-0 px-4 py-3 bg-surface-2/50 border-b border-surface-3 flex items-center gap-4 text-xs text-zinc-500 animate-slide-up">
          {toDate(activity.dateTime) && <span className="flex items-center gap-1"><Calendar size={11}/>{format(toDate(activity.dateTime),'MMM d, h:mm a')}</span>}
          <span className="flex items-center gap-1"><MapPin size={11}/>{activity.location}</span>
          <span className="flex items-center gap-1"><Users size={11}/>{acceptedCount + 1} people</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">{CAT_EMOJI[activity?.category]}</div>
            <p className="text-sm font-semibold text-zinc-400">No messages yet</p>
            <p className="text-xs text-zinc-600 mt-1">Say hello! 👋</p>
          </div>
        )}
        {grouped.map((item, i) => {
          if (item.type === 'date') return (
            <div key={i} className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-surface-3"/>
              <span className="text-xs text-zinc-600 px-3 py-1 bg-surface-2 rounded-full border border-surface-3">{item.date}</span>
              <div className="flex-1 h-px bg-surface-3"/>
            </div>
          )
          const { msg } = item
          const isMe = msg.senderId === myId
          const d = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date()
          const prevItem = grouped[i - 1]
          const prevSenderId = prevItem?.msg?.senderId
          const isFirstInGroup = prevSenderId !== msg.senderId || prevItem?.type === 'date'

          return (
            <div key={msg.id || i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}>
              {!isMe && <div className="w-7 flex-shrink-0 mb-1">{isFirstInGroup && <Avatar name={msg.senderName} size={26}/>}</div>}
              <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-0.5`}>
                {isFirstInGroup && !isMe && <span className="text-xs text-zinc-500 ml-1 font-medium">{msg.senderName}</span>}
                <div className={`px-4 py-2.5 text-sm leading-relaxed ${isMe ? 'bubble-me' : 'bubble-other'}`}>{msg.content}</div>
                <span className="text-[10px] text-zinc-700 px-1">{format(d, 'h:mm a')}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 bg-surface-1 border-t border-surface-3">
        {activity?.isDone ? (
          <div className="flex items-center justify-center py-3 text-sm text-zinc-500 gap-2">
            <CheckSquare size={14} className="text-green-500"/> Activity done — chat is read-only
          </div>
        ) : (
          <>
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <textarea className="input flex-1 resize-none min-h-[42px] max-h-28 py-2.5 text-sm"
                placeholder={`Message ${activity?.title || ''}...`} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                rows={1}/>
              <button type="submit" disabled={!input.trim() || sending} className="btn-primary p-2.5 rounded-xl disabled:opacity-40">
                {sending ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
              </button>
            </form>
            <p className="text-center text-[10px] text-zinc-700 mt-1.5">Enter to send · Shift+Enter for new line</p>
          </>
        )}
      </div>
    </div>
  )
}
