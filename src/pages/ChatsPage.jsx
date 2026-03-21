import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { EmptyState, Spinner, Avatar } from '../components/ui/index.jsx'
import { useChatContext } from '../context/ChatContext'
import { getMyActivities, getJoinedActivities, toDate } from '../utils/db'
import toast from 'react-hot-toast'

const CAT_EMOJI = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }
const CAT_COLOR = { Movie:'bg-purple-500/20 text-purple-300 border-purple-500/30',Gym:'bg-green-500/20 text-green-300 border-green-500/30',Travel:'bg-blue-500/20 text-blue-300 border-blue-500/30',Study:'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',Food:'bg-orange-500/20 text-orange-300 border-orange-500/30',Music:'bg-pink-500/20 text-pink-300 border-pink-500/30',Sports:'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',Gaming:'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',Hiking:'bg-lime-500/20 text-lime-300 border-lime-500/30',Other:'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' }

function smartTime(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export default function ChatsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const { chatMeta, markChatRead } = useChatContext()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  useEffect(() => {
    if (!user?.uid) return
    const load = async () => {
      try {
        const [created, joined] = await Promise.all([
          getMyActivities(user.uid),
          getJoinedActivities(user.uid),
        ])
        const createdWithMembers = created.filter(a => (a.joinRequests||[]).some(r=>r.status==='accepted'))
        const seen = new Set()
        const combined = []
        ;[...createdWithMembers, ...joined].forEach(a => {
          if (!seen.has(a.id)) { seen.add(a.id); combined.push(a) }
        })
        setChats(combined)
      } catch { toast.error('Failed to load') }
      finally { setLoading(false) }
    }
    load()
  }, [user?.uid])

  // ChatContext handles all realtime message subscriptions globally

  const getSortTime = (chat) => {
    const lm = chatMeta[chat.id]?.lastMsg?.createdAt
    if (!lm) return toDate(chat.dateTime)?.getTime() || 0
    return lm?.toDate ? lm.toDate().getTime() : new Date(lm).getTime()
  }

  const sorted = [...chats].sort((a, b) => getSortTime(b) - getSortTime(a))
  const usedCats = ['all', ...new Set(chats.map(c => c.category))]

  const filtered = sorted.filter(c => {
    const ms = !search || c.title.toLowerCase().includes(search.toLowerCase())
    const mc = catFilter === 'all' || c.category === catFilter
    return ms && mc
  })

  const openChat = (id) => { markChatRead(id); navigate(`/activity/${id}/chat`) }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-zinc-100">Messages</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{chats.length} chats</p>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"/>
        <input className="input pl-10 text-sm" placeholder="Search chats..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {!loading && chats.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {usedCats.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border flex-shrink-0 transition-all ${
                catFilter === cat
                  ? cat === 'all' ? 'bg-brand-500 text-white border-brand-500' : `${CAT_COLOR[cat]} border-current`
                  : 'bg-surface-2 text-zinc-400 border-surface-3 hover:bg-surface-3'
              }`}>
              {cat === 'all' ? '💬' : CAT_EMOJI[cat]} {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28}/></div>
      ) : chats.length === 0 ? (
        <EmptyState icon="💬" title="No chats yet" description="Join an activity to start chatting!"
          action={<button onClick={() => navigate('/')} className="btn-primary">Explore Activities</button>}/>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No chats found" description="Try a different filter."/>
      ) : (
        <div className="divide-y divide-surface-3 rounded-2xl border border-surface-3 overflow-hidden">
          {filtered.map(chat => {
            const meta = chatMeta[chat.id]
            const lastMsg = meta?.lastMsg
            const isCreator = chat.creatorId === user.uid
            const lastMsgTime = lastMsg?.createdAt
            const isPast = chat.isDone || (toDate(chat.dateTime) && toDate(chat.dateTime) < new Date())

            return (
              <button key={chat.id} onClick={() => openChat(chat.id)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-surface-1 hover:bg-surface-2 transition-all group text-left">
                <div className="relative flex-shrink-0">
                  <div className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-2xl cat-${chat.category} border`}>
                    {CAT_EMOJI[chat.category] || '🎯'}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface-1 ${isPast ? 'bg-zinc-600' : 'bg-green-500'}`}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-semibold text-zinc-200 truncate text-[14px] group-hover:text-brand-300 transition-colors">{chat.title}</span>
                    <span className="text-[11px] text-zinc-600 flex-shrink-0">{smartTime(lastMsgTime || chat.dateTime)}</span>
                  </div>
                  <p className="text-[12px] text-zinc-600 truncate mb-1.5">
                    {lastMsg ? <><span className="text-zinc-500">{lastMsg.senderName}: </span>{lastMsg.content}</> : <span className="italic">No messages yet</span>}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CAT_COLOR[chat.category]}`}>{CAT_EMOJI[chat.category]} {chat.category}</span>
                    {isCreator ? <span className="text-[10px] text-brand-400 font-bold">Host</span> : <span className="text-[10px] text-green-400 font-bold">Joined</span>}
                    {chat.isDone && <span className="text-[10px] text-green-500">✅</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
