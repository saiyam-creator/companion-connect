import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { EmptyState } from '../components/ui/index.jsx'
import { updateUserProfile } from '../utils/db'

export default function NotificationsPage() {
  const { user, updateUser } = useAuth()
  const notifications = user?.notifications || []

  useEffect(() => {
    if (!user?.uid || !notifications.some(n => !n.read)) return
    const updated = notifications.map(n => ({ ...n, read: true }))
    updateUserProfile(user.uid, { notifications: updated }).catch(() => {})
    updateUser({ notifications: updated })
  }, [])

  const getIcon = (type) => {
    if (type === 'accepted') return { emoji: '✅', bg: 'bg-green-500/15 text-green-400' }
    if (type === 'rejected') return { emoji: '❌', bg: 'bg-red-500/15 text-red-400' }
    if (type === 'join_request') return { emoji: '👋', bg: 'bg-brand-500/15 text-brand-400' }
    return { emoji: '🔔', bg: 'bg-zinc-500/15 text-zinc-400' }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
          <Bell size={18} className="text-brand-400"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Notifications</h1>
          <p className="text-sm text-zinc-500">{notifications.length} total</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="All caught up!" description="Join requests and approvals will appear here."/>
      ) : (
        <div className="space-y-2">
          {[...notifications].reverse().map((n, i) => {
            const { emoji, bg } = getIcon(n.type)
            return (
              <Link key={i} to={n.activityId ? `/activity/${n.activityId}` : '#'}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:border-brand-500/20 ${!n.read ? 'bg-brand-500/5 border-brand-500/15' : 'bg-surface-1 border-surface-3 hover:bg-surface-2'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${bg}`}>{emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.read ? 'text-zinc-200 font-medium' : 'text-zinc-400'}`}>{n.message}</p>
                  <p className="text-xs text-zinc-600 mt-1">{n.createdAt ? format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a') : ''}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"/>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
