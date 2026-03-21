import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { PlusCircle, MessageCircle, Clock, Bell, Bookmark, CheckSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { EmptyState, Spinner } from '../components/ui/index.jsx'
import { getMyActivities, getJoinedActivities, getUser, toDate } from '../utils/db'
import toast from 'react-hot-toast'

const CAT_EMOJI = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }
const TABS = [
  { key:'created', label:'Posted',    icon:PlusCircle   },
  { key:'joined',  label:'Joined',    icon:MessageCircle },
  { key:'done',    label:'Done',      icon:CheckSquare   },
  { key:'saved',   label:'Saved',     icon:Bookmark      },
  { key:'notifs',  label:'Alerts',    icon:Bell          },
]

export default function MyActivitiesPage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('created')
  const [data, setData] = useState({ created:[], joined:[], done:[], saved:[], notifs:[] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    const load = async () => {
      setLoading(true)
      try {
        const [created, joined, fullUser] = await Promise.all([
          getMyActivities(user.uid),
          getJoinedActivities(user.uid),
          getUser(user.uid),
        ])
        const now = new Date()
        const doneActivities = [...new Map(
          [...created, ...joined]
            .filter(a => a.isDone || (toDate(a.dateTime) && toDate(a.dateTime) < now))
            .map(a => [a.id, a])
        ).values()]

        // Bookmarked activities
        const bookmarkIds = fullUser?.bookmarks || []
        const allActivities = [...created, ...joined]
        const savedActivities = allActivities.filter(a => bookmarkIds.includes(a.id))

        setData({
          created,
          joined: joined.filter(a => !a.isDone && toDate(a.dateTime) >= now),
          done: doneActivities.sort((a,b) => (toDate(b.dateTime)||0) - (toDate(a.dateTime)||0)),
          saved: savedActivities,
          notifs: fullUser?.notifications || [],
        })
        updateUser({ notifications: fullUser?.notifications || [] })
      } catch { toast.error('Failed to load') }
      finally { setLoading(false) }
    }
    load()
  }, [user?.uid])

  const markNotifRead = async () => {
    try {
      const { updateUserProfile } = await import('../utils/db')
      await updateUserProfile(user.uid, { notifications: (user.notifications||[]).map(n=>({...n,read:true})) })
      updateUser({ notifications: (user.notifications||[]).map(n=>({...n,read:true})) })
    } catch {}
  }
  useEffect(() => { if (tab === 'notifs') markNotifRead() }, [tab])

  const unread = (user?.notifications||[]).filter(n=>!n.read).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">My Activities</h1>

      <div className="flex gap-1 bg-surface-2 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center relative min-w-fit ${
              tab === key ? 'bg-surface text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            <Icon size={13}/>{label}
            {key === 'notifs' && unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">{unread}</span>
            )}
            {key === 'done' && data.done.length > 0 && (
              <span className="ml-1 text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">{data.done.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner size={28}/></div> : (
        <>
          {tab === 'created' && (data.created.length === 0
            ? <EmptyState icon="📌" title="No activities posted" action={<Link to="/create" className="btn-primary">Post Activity</Link>}/>
            : <div className="space-y-2">{data.created.map(a => <ActivityRow key={a.id} activity={a} userId={user.uid} showRequests/>)}</div>
          )}
          {tab === 'joined' && (data.joined.length === 0
            ? <EmptyState icon="🤝" title="No active joined activities" action={<Link to="/" className="btn-primary">Explore Feed</Link>}/>
            : <div className="space-y-2">{data.joined.map(a => <ActivityRow key={a.id} activity={a} userId={user.uid} joined/>)}</div>
          )}
          {tab === 'done' && (data.done.length === 0
            ? <EmptyState icon="✅" title="No completed activities yet"/>
            : <div className="space-y-4">
                {data.done.filter(a=>a.isDone).length > 0 && <>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">✅ Marked Done — {data.done.filter(a=>a.isDone).length}</p>
                  {data.done.filter(a=>a.isDone).map(a=><ActivityRow key={a.id} activity={a} userId={user.uid} isDoneView/>)}
                </>}
                {data.done.filter(a=>!a.isDone).length > 0 && <div className="mt-2 opacity-70">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1 mb-2">⏰ Expired — {data.done.filter(a=>!a.isDone).length}</p>
                  {data.done.filter(a=>!a.isDone).map(a=><ActivityRow key={a.id} activity={a} userId={user.uid} isDoneView/>)}
                </div>}
              </div>
          )}
          {tab === 'saved' && (data.saved.length === 0
            ? <EmptyState icon="🔖" title="No saved activities" action={<Link to="/" className="btn-primary">Explore Feed</Link>}/>
            : <div className="space-y-2">{data.saved.map(a=><ActivityRow key={a.id} activity={a} userId={user.uid}/>)}</div>
          )}
          {tab === 'notifs' && (data.notifs.length === 0
            ? <EmptyState icon="🔔" title="No notifications"/>
            : <div className="space-y-2">{data.notifs.slice().reverse().map((n,i)=>(
                <Link key={i} to={n.activityId?`/activity/${n.activityId}`:'#'}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${!n.read?'bg-brand-500/5 border-brand-500/15':'bg-surface-1 border-surface-3 hover:bg-surface-2'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${n.type==='accepted'?'bg-green-500/15 text-green-400':n.type==='rejected'?'bg-red-500/15 text-red-400':'bg-brand-500/15 text-brand-400'}`}>
                    {n.type==='accepted'?'✅':n.type==='rejected'?'❌':'🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read?'text-zinc-200 font-medium':'text-zinc-400'}`}>{n.message}</p>
                    <p className="text-xs text-zinc-600 mt-1">{n.createdAt ? format(new Date(n.createdAt),'MMM d, h:mm a') : ''}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"/>}
                </Link>
              ))}</div>
          )}
        </>
      )}
    </div>
  )
}

function ActivityRow({ activity, userId, showRequests, joined, isDoneView }) {
  const dt = toDate(activity.dateTime)
  const isExpired = activity.isDone || (dt && dt < new Date())
  const isCreator = activity.creatorId === userId
  const pending = (activity.joinRequests||[]).filter(r=>r.status==='pending').length
  const accepted = (activity.joinRequests||[]).filter(r=>r.status==='accepted').length

  return (
    <Link to={`/activity/${activity.id}`} className="card p-4 flex items-center gap-3 hover:border-brand-500/30 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl cat-${activity.category} border flex-shrink-0`}>
        {CAT_EMOJI[activity.category]||'🎯'}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-brand-300 transition-colors truncate">{activity.title}</h3>
        <div className="flex items-center gap-2.5 flex-wrap mt-0.5">
          {dt && <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock size={10}/>{format(dt,'MMM d, h:mm a')}</span>}
          {showRequests && pending > 0 && <span className="text-xs text-yellow-400 font-semibold">{pending} pending</span>}
          {isCreator && <span className="text-xs text-brand-400 font-semibold">Host</span>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {activity.isDone && <span className="badge bg-green-500/15 text-green-400 border border-green-500/20 text-[10px]">✅ Done</span>}
        {!activity.isDone && isExpired && <span className="badge bg-zinc-500/15 text-zinc-500 border border-zinc-500/20 text-[10px]">Ended</span>}
        {(joined || (accepted > 0 && isCreator)) && !isExpired && (
          <Link to={`/activity/${activity.id}/chat`} onClick={e=>e.stopPropagation()} className="p-1.5 rounded-lg text-brand-400 hover:bg-brand-500/15 transition-colors">
            <MessageCircle size={15}/>
          </Link>
        )}
      </div>
    </Link>
  )
}
