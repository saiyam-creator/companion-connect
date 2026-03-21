import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { MapPin, Clock, Users, MessageCircle, Flag, ArrowLeft, CheckCircle, XCircle, Star, Shield, Trash2, ChevronRight, CheckSquare, Share2, Timer, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar, StarRating, Spinner, Modal } from '../components/ui/index.jsx'
import { getActivity, sendJoinRequest, respondToRequest, markActivityDone, deleteActivity, reportActivity, rateUser, bookmarkActivity, toDate } from '../utils/db'
import toast from 'react-hot-toast'

const CAT_BG = { Movie:'from-purple-900/40',Gym:'from-green-900/40',Travel:'from-blue-900/40',Study:'from-yellow-900/40',Food:'from-orange-900/40',Music:'from-pink-900/40',Sports:'from-cyan-900/40',Gaming:'from-indigo-900/40',Hiking:'from-lime-900/40',Other:'from-zinc-800/40' }
const CAT_EMOJI = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }

export default function ActivityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joinMsg, setJoinMsg] = useState('')
  const [joining, setJoining] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rateTarget, setRateTarget] = useState(null)
  const [rateVal, setRateVal] = useState(0)
  const [markingDone, setMarkingDone] = useState(false)

  const reload = async () => { const a = await getActivity(id); setActivity(a) }

  useEffect(() => {
    getActivity(id).then(a => { setActivity(a); setLoading(false) })
      .catch(() => { toast.error('Not found'); setLoading(false) })
  }, [id])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size={32}/></div>
  if (!activity) return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><span className="text-4xl">😕</span><Link to="/" className="btn-primary">Go Home</Link></div>

  const myId = user?.uid || ''
  const isCreator = activity.creatorId === myId
  const joinRequests = activity.joinRequests || []
  const myRequest = joinRequests.find(r => r.userId === myId)
  const acceptedMembers = joinRequests.filter(r => r.status === 'accepted')
  const pendingRequests = joinRequests.filter(r => r.status === 'pending')
  const spotsLeft = activity.maxPeople - 1 - acceptedMembers.length
  const isFull = spotsLeft <= 0
  const hasAccess = isCreator || myRequest?.status === 'accepted'
  const eventDate = toDate(activity.dateTime)
  const expiresDate = toDate(activity.expiresAt)
  const isExpired = eventDate && eventDate < new Date()
  const isDone = activity.isDone
  const deadlinePassed = expiresDate && expiresDate < new Date()

  const handleJoin = async () => {
    setJoining(true)
    try {
      await sendJoinRequest(id, user, joinMsg)
      toast.success('Join request sent! 🙌')
      setShowJoinModal(false); setJoinMsg('')
      await reload()
    } catch (err) { toast.error(err.message) }
    finally { setJoining(false) }
  }

  const handleRespond = async (userId, action) => {
    try { await respondToRequest(id, userId, action, activity); toast.success(`${action}ed`); await reload() }
    catch (err) { toast.error(err.message) }
  }

  const handleMarkDone = async () => {
    setMarkingDone(true)
    try { await markActivityDone(id, !isDone); toast.success(!isDone ? '✅ Marked done!' : 'Marked active'); await reload() }
    catch { toast.error('Failed') }
    finally { setMarkingDone(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this activity?')) return
    try { await deleteActivity(id); toast.success('Deleted'); navigate('/') }
    catch { toast.error('Failed') }
  }

  const handleReport = async () => {
    try { await reportActivity(id, myId); toast.success('Reported. Thanks!') }
    catch { toast.error('Already reported') }
  }

  const handleShare = () => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied! 🔗') }

  const handleRate = async () => {
    if (!rateVal) return toast.error('Select a rating')
    try { await rateUser(rateTarget.userId, rateVal); toast.success('Rating submitted! ⭐'); setShowRateModal(false); setRateVal(0) }
    catch { toast.error('Failed') }
  }

  const bgGrad = CAT_BG[activity.category] || 'from-zinc-800/40'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-10">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2"><ArrowLeft size={16}/> Back</button>

      <div className={`card overflow-hidden mb-4 bg-gradient-to-b ${bgGrad} to-surface-1`}>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`badge cat-${activity.category} border text-sm px-3 py-1.5`}>{CAT_EMOJI[activity.category]} {activity.category}</span>
                {isDone && <span className="badge bg-green-500/15 text-green-400 border border-green-500/20">✅ Done</span>}
                {isExpired && !isDone && <span className="badge bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">⏰ Expired</span>}
                {deadlinePassed && !isExpired && <span className="badge bg-red-500/15 text-red-400 border border-red-500/20">🔒 Deadline passed</span>}
              </div>
              <h1 className="text-xl font-bold text-zinc-100 leading-snug">{activity.title}</h1>
            </div>
            <div className="flex gap-1">
              <button onClick={handleShare} className="btn-ghost p-2 text-zinc-500"><Share2 size={15}/></button>
              {isCreator && <button onClick={handleDelete} className="btn-danger p-2"><Trash2 size={14}/></button>}
            </div>
          </div>
        </div>

        <div className="px-6 pb-4">
          <p className="text-zinc-400 text-sm leading-relaxed">{activity.description}</p>
          {activity.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activity.tags.map(t => <span key={t} className="chip">#{t}</span>)}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 grid grid-cols-2 gap-2">
          {eventDate && <MetaCard icon={Calendar} label="Date & Time" value={format(eventDate, 'EEE, MMM d, yyyy')} sub={format(eventDate, 'h:mm a')}/>}
          <MetaCard icon={MapPin} label="Location" value={activity.location} sub={activity.city}/>
          <MetaCard icon={Users} label="Group Size" value={`${activity.maxPeople} max`} sub={isFull ? '🔴 Full' : `${spotsLeft} spot${spotsLeft!==1?'s':''} left`} subColor={isFull?'text-red-400':'text-green-400'}/>
          {expiresDate
            ? <MetaCard icon={Timer} label="Join Deadline" value={format(expiresDate,'MMM d, h:mm a')} sub={deadlinePassed?'🔒 Closed':'⏳ Open'} subColor={deadlinePassed?'text-red-400':'text-green-400'}/>
            : <MetaCard icon={Users} label="Gender Pref" value={activity.genderPreference==='any'?'All welcome':activity.genderPreference} sub=""/>
          }
        </div>

        {/* Creator */}
        <div className="mx-6 mb-5 flex items-center gap-3 p-3 bg-surface-2/80 rounded-xl">
          <Avatar name={activity.creatorName} size={40}/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-200 text-sm">{activity.creatorName}</span>
              {activity.creatorVerified && <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20 text-[10px]">✓ Verified</span>}
            </div>
            <span className="text-xs text-zinc-500">{activity.city}</span>
          </div>
          {!isCreator && <button onClick={handleReport} className="btn-ghost p-2 text-zinc-600 hover:text-red-400"><Flag size={13}/></button>}
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 space-y-2">
          {hasAccess && (
            <button onClick={handleMarkDone} disabled={markingDone}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                isDone ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-surface-2 border-surface-3 text-zinc-400 hover:bg-surface-3'
              }`}>
              {markingDone ? <Spinner size={14}/> : <CheckSquare size={15}/>}
              {isDone ? '✅ Done — Click to undo' : 'Mark as Done'}
            </button>
          )}
          {hasAccess && (
            <Link to={`/activity/${id}/chat`} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <MessageCircle size={16}/> Open Group Chat <ChevronRight size={14}/>
            </Link>
          )}
          {!isExpired && !isDone && !isCreator && !myRequest && !deadlinePassed && (
            <button onClick={() => setShowJoinModal(true)} disabled={isFull}
              className={`btn-primary w-full py-3 ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isFull ? '🔴 Activity is Full' : '✋ Request to Join'}
            </button>
          )}
          {!isCreator && myRequest?.status === 'pending' && (
            <div className="flex items-center justify-center py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm font-medium">⏳ Join request pending...</div>
          )}
          {!isCreator && myRequest?.status === 'rejected' && (
            <div className="flex items-center justify-center py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">✗ Request declined</div>
          )}
        </div>
      </div>

      {/* Creator: manage requests */}
      {isCreator && joinRequests.length > 0 && (
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-zinc-200">Join Requests</h2>
            {pendingRequests.length > 0 && <span className="badge bg-brand-500/20 text-brand-400 border border-brand-500/30">{pendingRequests.length} pending</span>}
          </div>
          <div className="space-y-2">
            {joinRequests.map(req => (
              <div key={req.userId} className={`flex items-center gap-3 p-3 rounded-xl border ${req.status==='accepted'?'bg-green-500/5 border-green-500/20':req.status==='rejected'?'bg-red-500/5 border-red-500/10':'bg-surface-2 border-surface-3'}`}>
                <Avatar name={req.userName} size={36}/>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-200">{req.userName}</div>
                  {req.message && <p className="text-xs text-zinc-500 truncate">"{req.message}"</p>}
                  <span className={`text-xs font-bold ${req.status==='accepted'?'text-green-400':req.status==='rejected'?'text-red-400':'text-yellow-400'}`}>
                    {req.status==='accepted'?'✓ Accepted':req.status==='rejected'?'✗ Rejected':'⏳ Pending'}
                  </span>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-1.5">
                    <button onClick={() => handleRespond(req.userId,'accept')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-semibold"><CheckCircle size={13}/> Accept</button>
                    <button onClick={() => handleRespond(req.userId,'reject')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold"><XCircle size={13}/> Reject</button>
                  </div>
                )}
                {req.status === 'accepted' && (isExpired || isDone) && (
                  <button onClick={() => { setRateTarget(req); setShowRateModal(true) }} className="btn-ghost text-brand-400 text-xs px-2"><Star size={12}/> Rate</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants */}
      {acceptedMembers.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-zinc-200 mb-4">Participants ({acceptedMembers.length + 1})</h2>
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-2"><Avatar name={activity.creatorName} size={32}/><span className="text-sm text-zinc-300 flex-1">{activity.creatorName}</span><span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20 text-[10px]">Host</span></div>
            {acceptedMembers.map(r => (
              <div key={r.userId} className="flex items-center gap-3 p-2 hover:bg-surface-2 rounded-lg">
                <Avatar name={r.userName} size={32}/><span className="text-sm text-zinc-300 flex-1">{r.userName}</span>
                {(isExpired || isDone) && !isCreator && (
                  <button onClick={() => { setRateTarget(r); setShowRateModal(true) }} className="btn-ghost text-brand-400 text-xs px-2"><Star size={12}/> Rate</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={showJoinModal} onClose={() => setShowJoinModal(false)} title="Request to Join">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Send a message to the host (optional)</p>
          <textarea className="input resize-none" rows={3} placeholder="Hi! I'd love to join..." value={joinMsg} onChange={e => setJoinMsg(e.target.value)} maxLength={200}/>
          <div className="flex gap-3">
            <button onClick={() => setShowJoinModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleJoin} disabled={joining} className="btn-primary flex-1">{joining ? <Spinner size={16}/> : '✋ Send Request'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={showRateModal} onClose={() => { setShowRateModal(false); setRateVal(0) }} title={`Rate ${rateTarget?.userName}`}>
        <div className="space-y-5">
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRateVal(n)} className={`text-3xl transition-all hover:scale-110 ${n <= rateVal ? 'text-brand-400' : 'text-zinc-700'}`}>★</button>
            ))}
          </div>
          {rateVal > 0 && <p className="text-center text-sm text-zinc-400">{['','😞 Poor','😐 Fair','🙂 Good','😊 Great','🤩 Excellent!'][rateVal]}</p>}
          <div className="flex gap-3">
            <button onClick={() => setShowRateModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleRate} disabled={!rateVal} className="btn-primary flex-1">Submit Rating</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function MetaCard({ icon: Icon, label, value, sub, subColor = 'text-zinc-500' }) {
  return (
    <div className="bg-surface-2/80 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1"><Icon size={11}/>{label}</div>
      <div className="text-sm font-semibold text-zinc-200 leading-snug">{value}</div>
      {sub && <div className={`text-xs mt-0.5 font-medium ${subColor}`}>{sub}</div>}
    </div>
  )
}
