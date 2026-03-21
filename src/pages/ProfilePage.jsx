import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Edit3, Save, X, Shield, MapPin, Flag, Ban, Check, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar, Spinner } from '../components/ui/index.jsx'
import { getUser, updateUserProfile, blockUser, reportUser, getMyActivities, getRequestedActivities, toDate } from '../utils/db'
import { STATES, getCitiesForState } from '../utils/locations'
import toast from 'react-hot-toast'

const TABS = ['Profile','My Posts','Join Requests']
const CAT_EMOJI = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }

export default function ProfilePage() {
  const { id } = useParams()
  const { user, updateUser } = useAuth()
  const isOwn = !id || id === user?.uid
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [isBlocked, setIsBlocked] = useState(false)
  const [tab, setTab] = useState('Profile')
  const [posts, setPosts] = useState([])
  const [requests, setRequests] = useState([])
  const [tabLoading, setTabLoading] = useState(false)

  useEffect(() => {
    const uid = isOwn ? user?.uid : id
    if (!uid) return
    getUser(uid)
      .then(u => {
        setProfile(u)
        setForm({ name: u.name, age: u.age||'', gender: u.gender||'prefer_not_to_say', city: u.city||'Delhi', bio: u.bio||'' })
        if (!isOwn) setIsBlocked((user?.blockedUsers||[]).includes(uid))
      })
      .catch(() => toast.error('Profile not found'))
      .finally(() => setLoading(false))
  }, [id, isOwn, user?.uid])

  useEffect(() => {
    if (!isOwn || tab === 'Profile' || !user?.uid) return
    setTabLoading(true)
    if (tab === 'My Posts') {
      getMyActivities(user.uid).then(setPosts).finally(() => setTabLoading(false))
    } else if (tab === 'Join Requests') {
      getRequestedActivities(user.uid).then(setRequests).finally(() => setTabLoading(false))
    }
  }, [tab, isOwn, user?.uid])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { ...form, age: form.age ? Number(form.age) : null })
      updateUser({ ...form, age: form.age ? Number(form.age) : null })
      setProfile(p => ({ ...p, ...form }))
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleBlock = async () => {
    try {
      const blocked = await blockUser(user.uid, id)
      setIsBlocked(blocked)
      toast.success(blocked ? 'User blocked' : 'User unblocked')
    } catch { toast.error('Failed') }
  }

  const handleReport = async () => {
    if (!confirm('Report this user?')) return
    try { await reportUser(id); toast.success('Reported.') }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32}/></div>
  if (!profile) return null

  const avgRating = profile.ratingCount > 0 ? (profile.rating / profile.ratingCount).toFixed(1) : null
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile card */}
      <div className="card p-6 mb-4">
        <div className="flex items-start gap-5 mb-5">
          <div className="relative">
            <Avatar name={profile.name} src={profile.avatar} size={76}/>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center border-2 border-surface-1">
                <Check size={12} className="text-white"/>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {editing
              ? <input className="input text-lg font-bold mb-2" value={form.name} onChange={set('name')}/>
              : <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold text-zinc-100">{profile.name}</h1>
                  {profile.isVerified && <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs"><Shield size={10}/> Verified</span>}
                </div>
            }
            <div className="flex items-center gap-3 text-sm text-zinc-500 mb-2 flex-wrap">
              <span className="flex items-center gap-1"><MapPin size={11}/>{profile.city}</span>
              {profile.age && <span>{profile.age} yrs</span>}
              {profile.gender && profile.gender !== 'prefer_not_to_say' && <span className="capitalize">{profile.gender}</span>}
            </div>
            {avgRating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <span key={n} className={`text-sm ${n<=Math.round(parseFloat(avgRating))?'text-brand-400':'text-zinc-700'}`}>★</span>)}</div>
                <span className="text-sm font-bold text-zinc-300">{avgRating}</span>
                <span className="text-xs text-zinc-600">({profile.ratingCount})</span>
              </div>
            )}
          </div>
          {isOwn ? (
            editing
              ? <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-3">{saving ? <Spinner size={14}/> : <><Save size={14}/> Save</>}</button>
                  <button onClick={() => setEditing(false)} className="btn-secondary py-2 px-3"><X size={14}/></button>
                </div>
              : <button onClick={() => setEditing(true)} className="btn-secondary py-2 px-3"><Edit3 size={14}/> Edit</button>
          ) : (
            <div className="flex gap-1.5">
              <button onClick={handleBlock} className={`btn-ghost p-2 ${isBlocked?'text-red-400':'text-zinc-500'}`}><Ban size={16}/></button>
              <button onClick={handleReport} className="btn-ghost p-2 text-zinc-500 hover:text-red-400"><Flag size={16}/></button>
            </div>
          )}
        </div>

        <div className="pt-5 border-t border-surface-3">
          {editing ? (
            <div className="space-y-4">
              <div><label className="label">Bio</label><textarea className="input resize-none" rows={3} value={form.bio} onChange={set('bio')} maxLength={300}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Age</label><input type="number" className="input" min={13} max={100} value={form.age} onChange={set('age')}/></div>
                <div><label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={set('gender')}>
                    <option value="prefer_not_to_say">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option><option value="non-binary">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="label">State</label>
                  <select className="input" value={form.state||''} onChange={e => setForm(p => ({...p, state: e.target.value, city: ''}))}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">City</label>
                  <select className="input" value={form.city} onChange={set('city')}>
                    <option value="">Select city</option>
                    {getCitiesForState(form.state||'').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            profile.bio
              ? <p className="text-sm text-zinc-400 leading-relaxed">{profile.bio}</p>
              : <p className="text-sm text-zinc-600 italic">{isOwn ? 'Add a bio...' : 'No bio yet.'}</p>
          )}
        </div>
      </div>

      {!isOwn && null}
      {isOwn && !user?.isVerified && (
        <div className="card p-4 flex items-center gap-4 bg-blue-500/5 border-blue-500/20 mb-4">
          <Shield size={20} className="text-blue-400 flex-shrink-0"/>
          <div className="flex-1"><p className="text-sm font-semibold text-zinc-200">Get Verified Badge</p><p className="text-xs text-zinc-500">Builds trust. Coming soon!</p></div>
          <span className="badge bg-blue-500/15 text-blue-400 border border-blue-500/20 text-xs">Soon</span>
        </div>
      )}

      {isOwn && (
        <>
          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl mb-4">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${tab===t?'bg-surface text-zinc-100':'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>
            ))}
          </div>

          {tabLoading ? <div className="flex justify-center py-8"><Spinner size={24}/></div>
          : tab === 'My Posts' ? (
            posts.length === 0
              ? <div className="text-center py-10 text-zinc-500 text-sm">No activities posted. <Link to="/create" className="text-brand-400">Post one!</Link></div>
              : <div className="space-y-2">{posts.map(a => <MiniCard key={a.id} activity={a}/>)}</div>
          ) : tab === 'Join Requests' ? (
            requests.length === 0
              ? <div className="text-center py-10 text-zinc-500 text-sm">No requests sent. <Link to="/" className="text-brand-400">Browse!</Link></div>
              : <div className="space-y-2">{requests.map(a => {
                  const r = (a.joinRequests||[]).find(r => r.userId === user.uid)
                  return <MiniCard key={a.id} activity={a} requestStatus={r?.status}/>
                })}</div>
          ) : null}
        </>
      )}

      <p className="text-center text-xs text-zinc-700 mt-6">
        Member since {format(toDate(profile.createdAt) || new Date(), 'MMMM yyyy')}
      </p>
    </div>
  )
}

function MiniCard({ activity, requestStatus }) {
  const dt = toDate(activity.dateTime)
  return (
    <Link to={`/activity/${activity.id}`} className="card p-4 flex items-center gap-3 hover:border-brand-500/30 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl cat-${activity.category} border flex-shrink-0`}>
        {CAT_EMOJI[activity.category]||'🎯'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-brand-300 transition-colors truncate">{activity.title}</h4>
        <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock size={10}/>{dt ? format(dt,'MMM d') : ''}</span>
      </div>
      {requestStatus && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${requestStatus==='accepted'?'bg-green-500/15 text-green-400':requestStatus==='rejected'?'bg-red-500/15 text-red-400':'bg-yellow-500/15 text-yellow-400'}`}>
          {requestStatus==='accepted'?'✓ Accepted':requestStatus==='rejected'?'✗ Rejected':'⏳ Pending'}
        </span>
      )}
    </Link>
  )
}
