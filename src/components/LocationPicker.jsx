import { useState, useEffect } from 'react'
import { STATES, getCitiesForState } from '../utils/locations'
import { MapPin } from 'lucide-react'

/**
 * Reusable location picker: State → City → (Optional landmark)
 * Props:
 *   state, city, landmark — current values
 *   onChange(field, value) — called on change
 *   showLandmark — show place/landmark input (for activity creation)
 *   compact — smaller layout
 */
export default function LocationPicker({ state = '', city = '', landmark = '', onChange, showLandmark = false, compact = false }) {
  const [isOtherCity, setIsOtherCity] = useState(false)
  const [customCity, setCustomCity] = useState('')
  const cities = getCitiesForState(state)

  useEffect(() => {
    // If city is set but not in the list → it's a custom city
    if (city && state && state !== 'Other' && cities.length > 0 && !cities.includes(city)) {
      setIsOtherCity(true)
      setCustomCity(city)
    }
  }, [state])

  const handleStateChange = (newState) => {
    onChange('state', newState)
    onChange('city', '')
    setIsOtherCity(newState === 'Other')
    setCustomCity('')
  }

  const handleCitySelect = (c) => {
    if (c === '__other__') {
      setIsOtherCity(true)
      onChange('city', '')
    } else {
      setIsOtherCity(false)
      onChange('city', c)
    }
  }

  const handleCustomCity = (val) => {
    setCustomCity(val)
    onChange('city', val)
  }

  return (
    <div className="space-y-3">
      {/* State */}
      <div>
        <label className="label flex items-center gap-1"><MapPin size={11}/> State *</label>
        <select className="input" value={state} onChange={e => handleStateChange(e.target.value)}>
          <option value="">-- Select State --</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* City */}
      {state && state !== 'Other' && cities.length > 0 && !isOtherCity && (
        <div className="animate-fade-in">
          <label className="label">City *</label>
          {compact ? (
            <select className="input" value={city} onChange={e => handleCitySelect(e.target.value)}>
              <option value="">-- Select City --</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__other__">Other (type manually)</option>
            </select>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
              {cities.map(c => (
                <button key={c} type="button" onClick={() => handleCitySelect(c)}
                  className={`px-3 py-2 rounded-xl text-sm text-left font-medium transition-all border ${
                    city === c
                      ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                      : 'bg-surface-2 border-surface-3 text-zinc-400 hover:bg-surface-3 hover:text-zinc-200'
                  }`}>
                  {c}
                </button>
              ))}
              {/* Other option */}
              <button type="button" onClick={() => handleCitySelect('__other__')}
                className="px-3 py-2 rounded-xl text-sm text-left font-medium transition-all border bg-surface-2 border-dashed border-zinc-600 text-zinc-500 hover:bg-surface-3 hover:text-zinc-300 col-span-1">
                + Other city
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual city input — for "Other" state or "Other city" */}
      {(state === 'Other' || isOtherCity) && (
        <div className="animate-fade-in">
          <label className="label">City Name *</label>
          <input className="input" placeholder="Type your city name (e.g. Mathura, Puri...)"
            value={customCity} onChange={e => handleCustomCity(e.target.value)}
            autoFocus/>
          <p className="text-xs text-zinc-600 mt-1">
            Can't find your city? Type it here with correct spelling.
          </p>
          {state !== 'Other' && (
            <button type="button" onClick={() => { setIsOtherCity(false); setCustomCity(''); onChange('city', '') }}
              className="text-xs text-brand-400 hover:text-brand-300 mt-1 transition-colors">
              ← Back to city list
            </button>
          )}
        </div>
      )}

      {/* Landmark / Place (optional, for activity creation) */}
      {showLandmark && (
        <div>
          <label className="label">
            Place / Landmark
            <span className="text-zinc-600 normal-case font-normal ml-1">(optional)</span>
          </label>
          <input className="input" placeholder="e.g. PVR Cinemas, Central Park, Coffee House..."
            value={landmark} onChange={e => onChange('landmark', e.target.value)}/>
          <p className="text-xs text-zinc-600 mt-1">Helps companions find the exact spot</p>
        </div>
      )}
    </div>
  )
}
