import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { MapPin, Users, Clock, Bookmark, BookmarkCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { bookmarkActivity, toDate } from '../utils/db'
import toast from 'react-hot-toast'

const CAT_EMOJI = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }
const CAT_GLOW = {
  Movie:'rgba(168,85,247,.15)', Gym:'rgba(34,197,94,.15)', Travel:'rgba(59,130,246,.15)',
  Study:'rgba(234,179,8,.15)',  Food:'rgba(249,115,22,.15)',Music:'rgba(236,72,153,.15)',
  Sports:'rgba(6,182,212,.15)',  Gaming:'rgba(99,102,241,.15)',Hiking:'rgba(132,204,22,.15)',Other:'rgba(113,113,122,.15)'
}

function Avatar({ name, size=28 }) {
  const colors = ['#f97316','#3b82f6','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308']
  const c = colors[(name?.charCodeAt(0)||0) % colors.length]
  return (
    <div style={{width:size,height:size,background:`${c}20`,border:`1.5px solid ${c}40`,color:c,fontSize:size*.38}}
      className="rounded-full flex items-center justify-center font-black flex-shrink-0 uppercase">
      {name?.[0]||'?'}
    </div>
  )
}

export default function ActivityCard({ activity }) {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [bookmarked, setBookmarked] = useState(user?.bookmarks?.includes(activity.id))
  const [bookmarking, setBookmarking] = useState(false)

  const actId = activity.id
  const accepted = (activity.joinRequests||[]).filter(r=>r.status==='accepted').length
  const spotsLeft = activity.maxPeople - 1 - accepted
  const isFull = spotsLeft <= 0
  const myId = user?.uid||''
  const isCreator = activity.creatorId === myId
  const myReq = (activity.joinRequests||[]).find(r=>r.userId===myId)
  const eventDate = toDate(activity.dateTime)
  const deadlinePassed = activity.expiresAt && toDate(activity.expiresAt) < new Date()
  const cat = activity.category || 'Other'
  const glow = CAT_GLOW[cat]

  const handleBookmark = async (e) => {
    e.stopPropagation()
    if (bookmarking||!user) return
    setBookmarking(true)
    try {
      const isNow = await bookmarkActivity(user.uid, actId)
      setBookmarked(isNow)
      updateUser({ bookmarks: isNow ? [...(user.bookmarks||[]),actId] : (user.bookmarks||[]).filter(b=>b!==actId) })
      toast.success(isNow ? 'Saved 🔖' : 'Removed')
    } catch { toast.error('Failed') }
    finally { setBookmarking(false) }
  }

  const statusChip = () => {
    if (activity.isDone)           return <Chip c="green">✅ Done</Chip>
    if (isCreator)                 return <Chip c="orange">Your Post</Chip>
    if (myReq?.status==='accepted') return <Chip c="green">✓ Joined</Chip>
    if (myReq?.status==='pending')  return <Chip c="yellow">⏳ Pending</Chip>
    if (isFull)                    return <Chip c="red">Full</Chip>
    if (deadlinePassed)            return <Chip c="gray">🔒 Closed</Chip>
    return null
  }

  return (
    <div onClick={() => navigate(`/activity/${actId}`)}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group animate-fade-up
                  transition-all duration-300 hover:-translate-y-1`}
      style={{
        background: 'rgba(17,17,23,.95)',
        border: '1px solid rgba(255,255,255,.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,.4)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,.2)'
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,.5), 0 0 30px ${glow}`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.4)'
      }}>

      {/* Colored top stripe */}
      <div className={`cat-accent-${cat} h-0.5 w-full`}/>

      {/* Subtle glow bg */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-20 -translate-y-1/2 translate-x-1/2"
        style={{ background: `radial-gradient(circle, ${glow.replace('.15','0.6')} 0%, transparent 70%)` }}/>

      <div className="p-5 relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <span className={`badge border cat-${cat} text-xs`}>
            {CAT_EMOJI[cat]} {cat}
          </span>
          <button onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition-all ${bookmarked ? 'text-brand-400' : 'text-zinc-700 hover:text-zinc-400'}`}>
            {bookmarked ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
          </button>
        </div>

        {/* Title */}
        <h3 className="font-black text-zinc-100 leading-snug mb-1.5 text-[15px] group-hover:text-white transition-colors line-clamp-2">
          {activity.title}
        </h3>
        <p className="text-xs text-zinc-600 line-clamp-2 mb-4 leading-relaxed">{activity.description}</p>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          {eventDate && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock size={11} className="text-brand-500/70 flex-shrink-0"/>
              <span className="font-semibold">{format(eventDate,'EEE, MMM d · h:mm a')}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <MapPin size={11} className="text-brand-500/70 flex-shrink-0"/>
            <span className="truncate">{activity.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop:'1px solid rgba(255,255,255,.05)' }}>
          <div className="flex items-center gap-2">
            <Avatar name={activity.creatorName}/>
            <span className="text-xs text-zinc-500 font-semibold truncate max-w-[90px]">{activity.creatorName}</span>
          </div>
          <div className="flex items-center gap-2">
            {statusChip()}
            {!activity.isDone && (
              <div className={`flex items-center gap-1 text-[11px] font-bold ${isFull?'text-red-500':'text-zinc-600'}`}>
                <Users size={10}/>
                {isFull ? 'Full' : `${spotsLeft} left`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ children, c }) {
  const colors = {
    green:'rgba(34,197,94,.1)',   yellow:'rgba(234,179,8,.1)',
    red:'rgba(239,68,68,.1)',     orange:'rgba(249,115,22,.1)',
    gray:'rgba(113,113,122,.1)',
  }
  const text = {
    green:'#4ade80', yellow:'#facc15', red:'#f87171',
    orange:'#fb923c', gray:'#a1a1aa',
  }
  const border = {
    green:'rgba(34,197,94,.2)', yellow:'rgba(234,179,8,.2)',
    red:'rgba(239,68,68,.2)',   orange:'rgba(249,115,22,.2)',
    gray:'rgba(113,113,122,.2)',
  }
  return (
    <span className="badge text-[10px]"
      style={{ background:colors[c], color:text[c], border:`1px solid ${border[c]}` }}>
      {children}
    </span>
  )
}
