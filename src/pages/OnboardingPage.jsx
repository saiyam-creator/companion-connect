import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LocationPicker from '../components/LocationPicker'
import { Loader2, ArrowRight, MapPin, User, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const STEPS = ['welcome', 'location', 'profile']
const CAT_EMOJIS = ['🎬','💪','✈️','📚','🍜','🎵','⚽','🎮','🥾']

export default function OnboardingPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loc, setLoc] = useState({ state: '', city: '' })
  const [profile, setProfile] = useState({
    age: '', gender: user?.gender || 'prefer_not_to_say', bio: '',
  })

  const handleLocChange = (field, value) => setLoc(p => ({ ...p, [field]: value }))
  const set = (k) => (e) => setProfile(p => ({ ...p, [k]: e.target.value }))

  const handleFinish = async () => {
    setSaving(true)
    try {
      await updateUser({
        state: loc.state,
        city: loc.city || user?.city || 'Delhi',
        age: profile.age ? Number(profile.age) : null,
        gender: profile.gender,
        bio: profile.bio,
        onboardingDone: true,
      })
      toast.success('Profile setup done! Welcome 🎉')
      navigate('/')
    } catch {
      toast.error('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    await updateUser({ onboardingDone: true }).catch(() => {})
    navigate('/')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl"/>
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Progress */}
        <div className="w-full h-1 bg-surface-3 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}/>
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="text-7xl mb-5">🤝</div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">
              Welcome, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-zinc-500 mb-5 leading-relaxed">
              Let's set up your profile so you can find companions nearby.
            </p>
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {CAT_EMOJIS.map((e, i) => (
                <span key={i} className="text-2xl animate-fade-in" style={{ animationDelay: `${i * 70}ms` }}>{e}</span>
              ))}
            </div>
            <div className="space-y-3">
              <button onClick={() => setStep(1)} className="btn-primary w-full py-3.5 text-base">
                Set Up Profile <ArrowRight size={18}/>
              </button>
              <button onClick={handleSkip} className="btn-ghost w-full text-zinc-500 text-sm">
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Location */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                <MapPin size={20} className="text-brand-400"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Your Location</h2>
                <p className="text-sm text-zinc-500">Find activities near you</p>
              </div>
            </div>

            <LocationPicker
              state={loc.state} city={loc.city}
              onChange={handleLocChange}
              showLandmark={false}
            />

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="btn-secondary px-4">Back</button>
              <button onClick={() => {
                if (!loc.city) return toast.error('Please select your city')
                setStep(2)
              }} className="btn-primary flex-1 py-3">
                Continue <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Profile */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <User size={20} className="text-purple-400"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">About You</h2>
                <p className="text-sm text-zinc-500">Help others know you better</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Age <span className="text-zinc-600 font-normal normal-case">(optional)</span></label>
                  <input type="number" className="input" placeholder="24" min={13} max={100}
                    value={profile.age} onChange={set('age')}/>
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={profile.gender} onChange={set('gender')}>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Bio <span className="text-zinc-600 font-normal normal-case">(optional)</span></label>
                <textarea className="input resize-none" rows={3}
                  placeholder="Tell others about yourself — interests, vibe..."
                  value={profile.bio} onChange={set('bio')} maxLength={300}/>
              </div>

              {/* Summary */}
              <div className="card p-4 bg-surface-2/50">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">Your summary</p>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <MapPin size={13} className="text-brand-400"/>
                  <span>{loc.city}{loc.state ? `, ${loc.state}` : ''}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-secondary px-4">Back</button>
              <button onClick={handleFinish} disabled={saving} className="btn-primary flex-1 py-3">
                {saving
                  ? <Loader2 size={16} className="animate-spin"/>
                  : <><Sparkles size={16}/> Complete Setup</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${
              i === step ? 'w-6 h-2 bg-brand-500' :
              i < step ? 'w-2 h-2 bg-brand-500/50' : 'w-2 h-2 bg-surface-3'
            }`}/>
          ))}
        </div>
      </div>
    </div>
  )
}
