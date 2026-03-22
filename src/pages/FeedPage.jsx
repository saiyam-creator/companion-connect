import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { SlidersHorizontal, X, PlusCircle, Globe, MapPin, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ActivityCard from '../components/ActivityCard'
import { Spinner, EmptyState } from '../components/ui/index.jsx'
import { getFeedActivities, updateUserProfile } from '../utils/db'
import LocationPicker from '../components/LocationPicker'
import toast from 'react-hot-toast'

const CATEGORIES = ['all','Movie','Gym','Travel','Study','Food','Music','Sports','Gaming','Hiking','Other']
const CAT_EMOJI = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }

export default function FeedPage() {
  const { user, updateUser } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category:'all', gender:'any' })
  const [showFilters, setShowFilters] = useState(false)
  const [cityScope, setCityScope] = useState('my')
  const [showCityModal, setShowCityModal] = useState(false)
  const [selectedState, setSelectedState] = useState(user?.state||'')
  const [selectedCity, setSelectedCity] = useState('')
  const [savingCity, setSavingCity] = useState(false)

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    try {
      const results = await getFeedActivities({
        city: cityScope==='my' ? (user?.city||'Delhi') : null,
        category: filters.category!=='all' ? filters.category : null,
        gender: filters.gender!=='any' ? filters.gender : null,
        limitN: 50,
      })
      setActivities(results)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [cityScope, filters, user?.city])

  useEffect(() => { fetchFeed() }, [fetchFeed])

  const handleSaveCity = async () => {
    if (!selectedCity) return toast.error('Please select a city')
    setSavingCity(true)
    try {
      await updateUserProfile(user.uid, { state:selectedState, city:selectedCity })
      updateUser({ state:selectedState, city:selectedCity })
      setShowCityModal(false)
      toast.success(`City changed to ${selectedCity}! 📍`)
    } catch { toast.error('Failed') }
    finally { setSavingCity(false) }
  }

  const activeFilterCount = (filters.category!=='all'?1:0)+(filters.gender!=='any'?1:0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Explore</h1>
          <button onClick={() => setShowCityModal(true)}
            className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-brand-400 transition-colors">
            <MapPin size={12} className="text-brand-500"/>
            <span className="font-semibold">{user?.city}</span>
            {user?.state && <span className="text-zinc-700">, {user.state}</span>}
            <span className="text-zinc-700 text-xs ml-1 underline underline-offset-2">change</span>
          </button>
        </div>
        <Link to="/create" className="btn-primary gap-2">
          <PlusCircle size={15}/> Post Activity
        </Link>
      </div>

      {/* City scope toggle */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex p-1 rounded-xl gap-1" style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)' }}>
          {[
            { v:'my', icon:MapPin, label:'My City'   },
            { v:'all', icon:Globe, label:'All India' },
          ].map(({ v, icon:Icon, label }) => (
            <button key={v} onClick={() => setCityScope(v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                cityScope===v ? 'text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-400'
              }`}
              style={cityScope===v ? {
                background:'linear-gradient(135deg,#f97316,#ea580c)',
                boxShadow:'0 4px 12px rgba(249,115,22,.3)'
              } : {}}>
              <Icon size={11}/> {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-700 font-medium">
          {cityScope==='my' ? `Activities in ${user?.city}` : 'All activities across India'}
        </span>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilters(p=>({...p,category:cat}))}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
              filters.category===cat
                ? 'text-white shadow-glow-sm'
                : 'text-zinc-600 hover:text-zinc-300'
            }`}
            style={filters.category===cat ? {
              background:'linear-gradient(135deg,rgba(249,115,22,.2),rgba(234,88,12,.2))',
              border:'1px solid rgba(249,115,22,.3)',
            } : {
              background:'rgba(255,255,255,.03)',
              border:'1px solid rgba(255,255,255,.06)',
            }}>
            {cat!=='all' && CAT_EMOJI[cat]} {cat==='all'?'All':cat}
          </button>
        ))}
        <div className="w-px h-4 flex-shrink-0" style={{ background:'rgba(255,255,255,.06)' }}/>
        <button onClick={() => setShowFilters(p=>!p)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${activeFilterCount>0?'text-brand-400':'text-zinc-600 hover:text-zinc-300'}`}
          style={{
            background: activeFilterCount>0 ? 'rgba(249,115,22,.1)' : 'rgba(255,255,255,.03)',
            border: activeFilterCount>0 ? '1px solid rgba(249,115,22,.25)' : '1px solid rgba(255,255,255,.06)',
          }}>
          <SlidersHorizontal size={11}/>
          Filters {activeFilterCount>0&&`(${activeFilterCount})`}
        </button>
        {activeFilterCount>0 && (
          <button onClick={() => setFilters({category:'all',gender:'any'})}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 flex-shrink-0 transition-all"
            style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.15)' }}>
            <X size={9}/> Clear
          </button>
        )}
      </div>

      {/* Gender filter */}
      {showFilters && (
        <div className="card p-4 mb-4 animate-slide-up">
          <label className="label">Gender Preference</label>
          <div className="flex gap-2 flex-wrap">
            {['any','male','female','non-binary'].map(g => (
              <button key={g} onClick={() => setFilters(p=>({...p,gender:g}))}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filters.gender===g?'text-brand-400':'text-zinc-600 hover:text-zinc-300'}`}
                style={filters.gender===g ? {
                  background:'rgba(249,115,22,.1)', border:'1px solid rgba(249,115,22,.25)'
                } : { background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)' }}>
                {g==='any'?'Any gender':g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=>(
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-4 w-20"/>
              <div className="skeleton h-5 w-4/5"/>
              <div className="skeleton h-3 w-full"/>
              <div className="skeleton h-3 w-3/4"/>
              <div className="skeleton h-3 w-1/2"/>
            </div>
          ))}
        </div>
      ) : activities.length===0 ? (
        <EmptyState icon="🗺️" title="No activities found"
          description={cityScope==='my' ? `No activities in ${user?.city} yet. Be the first!` : 'No activities found. Try different filters.'}
          action={<Link to="/create" className="btn-primary">Post an Activity</Link>}/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {activities.map(a => <ActivityCard key={a.id} activity={a}/>)}
        </div>
      )}

      {/* City change modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCityModal(false)}/>
          <div className="relative card w-full max-w-md p-6 animate-slide-up max-h-[85vh] flex flex-col"
            style={{ background:'rgba(14,14,18,.98)', border:'1px solid rgba(255,255,255,.08)' }}>
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <h2 className="text-base font-black text-white">Change City</h2>
              <button onClick={() => setShowCityModal(false)} className="btn-ghost p-1.5 text-zinc-500">✕</button>
            </div>
            <div className="overflow-y-auto flex-1">
              <LocationPicker
                state={selectedState} city={selectedCity}
                onChange={(f,v) => { if(f==='state'){setSelectedState(v);setSelectedCity('')} if(f==='city')setSelectedCity(v) }}
                compact={false}/>
            </div>
            <div className="flex gap-3 mt-5 flex-shrink-0">
              <button onClick={() => setShowCityModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveCity} disabled={!selectedCity||savingCity} className="btn-primary flex-1">
                {savingCity ? <Spinner size={15}/> : `Save — ${selectedCity||'Select city'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
