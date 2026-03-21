import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { MapPin, Users, Clock, Bookmark, BookmarkCheck, Timer } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from './ui/index.jsx'
import { useAuth } from '../context/AuthContext'
import { bookmarkActivity, toDate } from '../utils/db'
import toast from 'react-hot-toast'

const CAT_EMOJI = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }
const CAT_ACCENT = {
  Movie:'border-t-purple-500/60', Gym:'border-t-green-500/60', Travel:'border-t-blue-500/60',
  Study:'border-t-yellow-500/60', Food:'border-t-orange-500/60', Music:'border-t-pink-500/60',
  Sports:'border-t-cyan-500/60', Gaming:'border-t-indigo-500/60', Hiking:'border-t-lime-500/60', Other:'border-t-zinc-500/60',
}

export default function ActivityCard({ activity }) {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [bookmarked, setBookmarked] = useState(user?.bookmarks?.includes(activity.id))
  const [bookmarking, setBookmarking] = useState(false)

  // Firestore uses .id not ._id
  const actId = activity.id
  const acceptedCount = (activity.joinRequests || []).filter(r => r.status === 'accepted').length
  const spotsLeft = activity.maxPeople - 1 - acceptedCount
  const isFull = spotsLeft <= 0
  const isDone = activity.isDone
  const myId = user?.uid || ''
  const isCreator = activity.creatorId === myId
  const myRequest = (activity.joinRequests || []).find(r => r.userId === myId)
  const deadlinePassed = activity.expiresAt && toDate(activity.expiresAt) < new Date()
  const eventDate = toDate(activity.dateTime)
  const deadline = toDate(activity.expiresAt)

  const handleBookmark = async (e) => {
    e.stopPropagation()
    if (bookmarking || !user) return
    setBookmarking(true)
    try {
      const isNowBookmarked = await bookmarkActivity(user.uid, actId)
      setBookmarked(isNowBookmarked)
      updateUser({ bookmarks: isNowBookmarked
        ? [...(user.bookmarks || []), actId]
        : (user.bookmarks || []).filter(b => b !== actId)
      })
      toast.success(isNowBookmarked ? 'Saved! 🔖' : 'Removed')
    } catch { toast.error('Failed') }
    finally { setBookmarking(false) }
  }

  const statusChip = () => {
    if (isDone) return <span className="badge bg-green-500/15 text-green-400 border border-green-500/20 text-[10px]">✅ Done</span>
    if (isCreator) return <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20 text-[10px]">Your Post</span>
    if (myRequest?.status === 'accepted') return <span className="badge bg-green-500/15 text-green-400 border border-green-500/20 text-[10px]">✓ Joined</span>
    if (myRequest?.status === 'pending') return <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 text-[10px]">⏳ Pending</span>
    if (isFull) return <span className="badge bg-red-500/15 text-red-400 border border-red-500/20 text-[10px]">Full</span>
    if (deadlinePassed) return <span className="badge bg-zinc-500/15 text-zinc-400 border border-zinc-500/20 text-[10px]">🔒 Closed</span>
    return null
  }

  return (
    <div onClick={() => navigate(`/activity/${actId}`)}
      className={`card p-5 cursor-pointer border-t-2 ${CAT_ACCENT[activity.category] || 'border-t-zinc-500/60'} hover:bg-surface-2/50 hover:-translate-y-0.5 transition-all duration-200 group animate-fade-in`}>

      <div className="flex items-center justify-between mb-3">
        <span className={`badge cat-${activity.category} border text-xs`}>
          {CAT_EMOJI[activity.category]} {activity.category}
        </span>
        <button onClick={handleBookmark}
          className={`p-1.5 rounded-lg transition-all ${bookmarked ? 'text-brand-400 bg-brand-500/10' : 'text-zinc-600 hover:text-zinc-300 hover:bg-surface-3'}`}>
          {bookmarked ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
        </button>
      </div>

      <h3 className="font-bold text-zinc-100 group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug mb-2 text-[15px]">
        {activity.title}
      </h3>
      <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed">{activity.description}</p>

      <div className="space-y-1.5 mb-4">
        {eventDate && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock size={11} className="text-brand-500/70 flex-shrink-0"/>
            <span className="font-medium">{format(eventDate, 'EEE, MMM d · h:mm a')}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <MapPin size={11} className="text-brand-500/70 flex-shrink-0"/>
          <span className="truncate">{activity.location}</span>
        </div>
        {deadline && !deadlinePassed && (
          <div className="flex items-center gap-2 text-xs text-yellow-500/80">
            <Timer size={11} className="flex-shrink-0"/>
            <span>Join by {format(deadline, 'MMM d, h:mm a')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-surface-3">
        <div className="flex items-center gap-2">
          <Avatar name={activity.creatorName} size={22}/>
          <span className="text-xs text-zinc-400 font-medium truncate max-w-[100px]">{activity.creatorName}</span>
        </div>
        <div className="flex items-center gap-2">
          {statusChip()}
          {!isDone && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${isFull ? 'text-red-400' : 'text-zinc-500'}`}>
              <Users size={10}/>
              {isFull ? 'Full' : `${spotsLeft} left`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
