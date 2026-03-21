import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createActivity } from '../utils/db'
import { Timestamp } from '../utils/firebase'
import LocationPicker from '../components/LocationPicker'
import toast from 'react-hot-toast'
import { ArrowLeft, PlusCircle } from 'lucide-react'

const CATEGORIES = ['Movie','Gym','Travel','Study','Food','Music','Sports','Gaming','Hiking','Other']
const CAT_EMOJI  = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }
const CAT_COLORS = {
  Movie:'border-purple-500 bg-purple-500/15 text-purple-300',
  Gym:'border-green-500 bg-green-500/15 text-green-300',
  Travel:'border-blue-500 bg-blue-500/15 text-blue-300',
  Study:'border-yellow-500 bg-yellow-500/15 text-yellow-300',
  Food:'border-orange-500 bg-orange-500/15 text-orange-300',
  Music:'border-pink-500 bg-pink-500/15 text-pink-300',
  Sports:'border-cyan-500 bg-cyan-500/15 text-cyan-300',
  Gaming:'border-indigo-500 bg-indigo-500/15 text-indigo-300',
  Hiking:'border-lime-500 bg-lime-500/15 text-lime-300',
  Other:'border-zinc-500 bg-zinc-500/15 text-zinc-300',
}

export default function CreateActivityPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category: 'Movie',
    dateTime: '', expiresAt: '',
    state: user?.state || '',
    city: user?.city || '',
    landmark: '',   // specific place/landmark
    maxPeople: 2, genderPreference: 'any', visibility: 'public', tags: ''
  })

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const handleLocChange = (field, value) => setForm(p => ({ ...p, [field]: value }))

  // Full location string: landmark + city or just city
  const fullLocation = form.landmark
    ? `${form.landmark}, ${form.city}`
    : form.city

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.dateTime)
      return toast.error('Please fill title, description and date')
    if (!form.city)
      return toast.error('Please select your city')
    const dt = new Date(form.dateTime)
    if (dt <= new Date()) return toast.error('Event must be in the future')
    if (form.expiresAt && new Date(form.expiresAt) >= dt)
      return toast.error('Join deadline must be before event date')

    setLoading(true)
    try {
      const id = await createActivity({
        title: form.title,
        description: form.description,
        category: form.category,
        dateTime: Timestamp.fromDate(dt),
        expiresAt: form.expiresAt ? Timestamp.fromDate(new Date(form.expiresAt)) : null,
        location: fullLocation,    // "Coffee House, Connaught Place"
        landmark: form.landmark,   // stored separately
        city: form.city,
        state: form.state,
        maxPeople: Number(form.maxPeople),
        genderPreference: form.genderPreference,
        visibility: form.visibility,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        creatorId: user.uid,
        creatorName: user.name,
        creatorAvatar: user.avatar || '',
        creatorVerified: user.isVerified || false,
        acceptedUids: [],
        requestedUids: [],
      })
      toast.success('Activity posted! 🎉')
      navigate(`/activity/${id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  const minStr = new Date(Date.now() + 30 * 60000).toISOString().slice(0,16)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft size={16}/> Back
      </button>
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">Post an Activity</h1>
      <p className="text-sm text-zinc-500 mb-6">Find companions for your next adventure</p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map(cat => (
              <button type="button" key={cat}
                onClick={() => setForm(p => ({ ...p, category: cat }))}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                  form.category === cat ? CAT_COLORS[cat] : 'border-surface-3 bg-surface-2 text-zinc-500 hover:bg-surface-3'
                }`}>
                <span className="text-xl">{CAT_EMOJI[cat]}</span>{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder={`e.g. ${CAT_EMOJI[form.category]} ${
            form.category === 'Movie' ? 'Watch Dune at PVR' :
            form.category === 'Gym' ? 'Morning Gym Partner' :
            form.category === 'Travel' ? 'Leh Ladakh Road Trip' :
            form.category === 'Food' ? 'Street Food Hunt' : 'Looking for companions'
          }`} value={form.title} onChange={set('title')} maxLength={100}/>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description *</label>
          <textarea className="input resize-none" rows={3}
            placeholder="Tell people what to expect, vibe, requirements..."
            value={form.description} onChange={set('description')} maxLength={1000}/>
          <div className="text-right text-xs text-zinc-600 mt-1">{form.description.length}/1000</div>
        </div>

        {/* Date & Time + Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Event Date & Time *</label>
            <input type="datetime-local" className="input" min={minStr}
              value={form.dateTime} onChange={set('dateTime')}/>
          </div>
          <div>
            <label className="label">Join Deadline <span className="text-zinc-600 font-normal normal-case">(optional)</span></label>
            <input type="datetime-local" className="input" min={minStr}
              value={form.expiresAt} onChange={set('expiresAt')}/>
          </div>
        </div>

        {/* Location — State → City → Landmark */}
        <div className="card p-4 space-y-1">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">📍 Location</p>
          <LocationPicker
            state={form.state}
            city={form.city}
            landmark={form.landmark}
            onChange={handleLocChange}
            showLandmark={true}
            compact={false}
          />
          {/* Preview */}
          {form.city && (
            <div className="mt-3 px-3 py-2 bg-surface-3/50 rounded-xl text-xs text-zinc-400 flex items-center gap-2">
              <span>📍</span>
              <span>{fullLocation}{form.state ? `, ${form.state}` : ''}</span>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="card p-4 space-y-4">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Activity Settings</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Max People</label>
              <input type="number" className="input" min={2} max={50}
                value={form.maxPeople} onChange={set('maxPeople')}/>
            </div>
            <div>
              <label className="label">Gender Pref</label>
              <select className="input" value={form.genderPreference} onChange={set('genderPreference')}>
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
            <div>
              <label className="label">Visibility</label>
              <select className="input" value={form.visibility} onChange={set('visibility')}>
                <option value="public">Public</option>
                <option value="verified_only">Verified Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Tags <span className="text-zinc-600 font-normal normal-case">(comma-separated)</span></label>
            <input className="input" placeholder="casual, beginner-friendly, vegetarian"
              value={form.tags} onChange={set('tags')}/>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <><PlusCircle size={16}/> Post Activity</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
