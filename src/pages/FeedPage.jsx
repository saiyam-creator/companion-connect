import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { SlidersHorizontal, X, PlusCircle, Globe, MapPin } from 'lucide-react'
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
  const [filters, setFilters] = useState({ category: 'all', gender: 'any' })
  const [showFilters, setShowFilters] = useState(false)

  // City scope: 'my' = user's city only | 'all' = all India
  const [cityScope, setCityScope] = useState('my')

  // For city change modal
  const [showCityModal, setShowCityModal] = useState(false)
  const [selectedState, setSelectedState] = useState(user?.state || '')
  const [selectedCity, setSelectedCity] = useState('')
  const [savingCity, setSavingCity] = useState(false)

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    try {
      const results = await getFeedActivities({
        city: cityScope === 'my' ? (user?.city || 'Delhi') : null,  // null = all cities
        category: filters.category !== 'all' ? filters.category : null,
        gender: filters.gender !== 'any' ? filters.gender : null,
        limitN: 50,
      })
      setActivities(results)
    } catch {
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [cityScope, filters, user?.city])

  useEffect(() => { fetchFeed() }, [fetchFeed])

  const handleSaveCity = async () => {
    if (!selectedCity) return toast.error('Please select a city')
    setSavingCity(true)
    try {
      await updateUserProfile(user.uid, { state: selectedState, city: selectedCity })
      updateUser({ state: selectedState, city: selectedCity })
      setShowCityModal(false)
      toast.success(`City changed to ${selectedCity}! 📍`)
    } catch {
      toast.error('Failed to update city')
    } finally {
      setSavingCity(false)
    }
  }

  const resetFilters = () => setFilters({ category: 'all', gender: 'any' })
  const activeFilterCount = (filters.category !== 'all' ? 1 : 0) + (filters.gender !== 'any' ? 1 : 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Explore</h1>
          <button onClick={() => setShowCityModal(true)}
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-brand-400 transition-colors mt-0.5">
            <MapPin size={12}/>
            {user?.city}{user?.state ? `, ${user.state}` : ''}
            <span className="text-zinc-600 text-xs ml-1">· change</span>
          </button>
        </div>
        <Link to="/create" className="btn-primary"><PlusCircle size={16}/> Post Activity</Link>
      </div>

      {/* City scope toggle — My City / All India */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex bg-surface-2 p-1 rounded-xl border border-surface-3">
          <button onClick={() => setCityScope('my')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              cityScope === 'my'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}>
            <MapPin size={12}/> My City
          </button>
          <button onClick={() => setCityScope('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              cityScope === 'all'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}>
            <Globe size={12}/> All India
          </button>
        </div>

        {cityScope === 'my' && (
          <span className="text-xs text-zinc-600 flex items-center gap-1">
            Showing activities in <span className="text-zinc-400 font-medium">{user?.city}</span>
          </span>
        )}
        {cityScope === 'all' && (
          <span className="text-xs text-zinc-600">Showing activities across India</span>
        )}
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilters(p => ({ ...p, category: cat }))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all border ${
              filters.category === cat
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/20'
                : 'bg-surface-2 text-zinc-400 border-surface-3 hover:bg-surface-3'
            }`}>
            {cat !== 'all' && <span>{CAT_EMOJI[cat]}</span>}
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}

        <div className="w-px h-5 bg-surface-3 flex-shrink-0"/>

        <button onClick={() => setShowFilters(p => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 transition-all ${
            activeFilterCount > 0
              ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
              : 'bg-surface-2 text-zinc-400 border-surface-3 hover:bg-surface-3'
          }`}>
          <SlidersHorizontal size={11}/>
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>

        {activeFilterCount > 0 && (
          <button onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-red-400 bg-red-500/10 border border-red-500/20 flex-shrink-0">
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
              <button key={g} onClick={() => setFilters(p => ({ ...p, gender: g }))}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  filters.gender === g
                    ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                    : 'bg-surface-2 text-zinc-400 border-surface-3 hover:bg-surface-3'
                }`}>
                {g === 'any' ? 'Any gender' : g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-4 w-20 rounded"/>
              <div className="skeleton h-5 w-4/5 rounded"/>
              <div className="skeleton h-4 w-full rounded"/>
              <div className="skeleton h-4 w-3/4 rounded"/>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="No activities found"
          description={
            cityScope === 'my'
              ? `No activities in ${user?.city} yet. Be the first to post!`
              : 'No activities found. Try changing your filters.'
          }
          action={<Link to="/create" className="btn-primary">Post an Activity</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map(a => <ActivityCard key={a.id} activity={a}/>)}
        </div>
      )}

      {/* Change City Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCityModal(false)}/>
          <div className="relative card w-full max-w-md p-6 animate-slide-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <h2 className="text-lg font-bold text-zinc-100">Change Your City</h2>
              <button onClick={() => setShowCityModal(false)} className="btn-ghost p-1.5 text-zinc-500">✕</button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1">
              <LocationPicker
                state={selectedState}
                city={selectedCity}
                onChange={(field, val) => {
                  if (field === 'state') { setSelectedState(val); setSelectedCity('') }
                  if (field === 'city') setSelectedCity(val)
                }}
                compact={false}
              />
            </div>

            <div className="flex gap-3 mt-5 flex-shrink-0">
              <button onClick={() => setShowCityModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveCity} disabled={!selectedCity || savingCity}
                className="btn-primary flex-1">
                {savingCity
                  ? <Spinner size={16}/>
                  : `Save — ${selectedCity || 'Select city'}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
