import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, Zap, Check, ExternalLink } from 'lucide-react'

const CITIES = ['Delhi','Mumbai','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow']

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name:'', email:'', password:'', age:'', gender:'prefer_not_to_say', city:'Delhi' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogle] = useState(false)
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.email.trim()) return toast.error('Email is required')
    if (!form.password || form.password.length < 6) return toast.error('Password must be 6+ characters')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signup({ ...form, age: form.age ? Number(form.age) : null })
      navigate('/onboarding')
    } catch (err) {
      const code = err.code || ''
      toast.error(
        code.includes('email-already-in-use') ? 'Email already registered. Sign in instead.' :
        code.includes('invalid-email') ? 'Invalid email address' :
        'Signup failed. Try again.'
      )
      setStep(1)
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGoogle(true)
    try { await loginWithGoogle(); navigate('/onboarding') }
    catch (err) { if (err.code !== 'auth/popup-closed-by-user') toast.error('Google sign-in failed.') }
    finally { setGoogle(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#09090b]">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col p-12 overflow-hidden border-r border-zinc-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
            style={{ background:'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)' }}/>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full"
            style={{ background:'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)' }}/>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <div>
              <div className="font-black text-zinc-100 text-lg leading-none">Companion</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest mt-0.5">Connect</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-black text-zinc-100 leading-tight mb-4">
              Join thousands<br/>finding real<br/>
              <span className="text-gradient">companions</span>
            </h2>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              No filters. No algorithms.<br/>Just real people, real activities.
            </p>

            <div className="space-y-3">
              {[
                ['✅', 'Free forever'],
                ['🔒', 'Safe, verified community'],
                ['📍', 'City-based discovery'],
                ['💬', 'Chat only after approval'],
                ['⭐', 'Rating & review system'],
                ['🔔', 'Realtime notifications'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3 text-sm text-zinc-400">
                  <span className="text-base">{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>

          {/* About founder */}
          <div className="mt-8 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center text-xl flex-shrink-0">
                🧑‍💻
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-zinc-200">Saiyam Jain</span>
                  <span className="text-[10px] px-2 py-0.5 bg-brand-500/15 text-brand-400 rounded-full font-bold border border-brand-500/20">Founder</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  20 y/o · BCA Final Year Student · Building products that connect people IRL
                </p>
                <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-2 transition-colors font-semibold">
                  View Portfolio <ExternalLink size={10}/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-14">
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="font-black text-zinc-100">Companion Connect</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= 1 ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
              {step > 1 ? <Check size={14}/> : '1'}
            </div>
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step > 1 ? 'bg-brand-500' : 'bg-zinc-800'}`}/>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= 2 ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
              2
            </div>
          </div>

          <h2 className="text-2xl font-black text-zinc-100 mb-1">
            {step === 1 ? 'Create account' : 'Your details'}
          </h2>
          <p className="text-zinc-500 text-sm mb-7">
            {step === 1 ? 'Join the community today' : 'Help others find the right companion'}
          </p>

          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-fade-up">
              <button onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-zinc-100 active:scale-[0.98] text-zinc-900 font-bold rounded-2xl transition-all text-sm disabled:opacity-60 shadow-sm mb-5">
                {googleLoading ? <Loader2 size={18} className="animate-spin text-zinc-400"/> : <GoogleIcon/>}
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-zinc-800"/>
                <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-800"/>
              </div>
              <form onSubmit={handleNext} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" placeholder="Arjun Sharma" value={form.name} onChange={set('name')} autoFocus/>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')}/>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="Min 6 characters"
                      value={form.password} onChange={set('password')}/>
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                      {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3.5 text-[15px] rounded-2xl mt-2">
                  Continue <ArrowRight size={16}/>
                </button>
              </form>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="animate-fade-up space-y-4">
              <p className="text-xs text-zinc-600 -mt-2">These help others know you. You can edit anytime.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Age <span className="normal-case font-normal">(optional)</span></label>
                  <input type="number" className="input" placeholder="24" min={13} max={100} value={form.age} onChange={set('age')}/>
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={set('gender')}>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">City</label>
                <select className="input" value={form.city} onChange={set('city')}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary rounded-2xl px-4">
                  <ArrowLeft size={15}/>
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3.5 rounded-2xl text-[15px]">
                  {loading ? <Loader2 size={17} className="animate-spin"/> : 'Create Account 🎉'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-zinc-500 mt-7">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">Sign in</Link>
          </p>

          {/* Sai Tech */}
          <div className="mt-10 pt-5 border-t border-zinc-800/60 flex items-center justify-center">
            <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-all">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-brand-500/40 group-hover:bg-brand-500/5 transition-all">
                <Zap size={12} className="text-brand-500"/>
                <span className="text-[12px] font-black text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  sai<span className="text-brand-500">tech</span>
                </span>
              </div>
              <span className="text-[11px] font-medium">Crafted with ❤️</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.7 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.2 3l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.6 0 20-7.7 20-21 0-1.3-.2-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 6 1.1 8.2 3l5.7-5.7C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 10-1.9 13.7-5.1l-6.3-5.3C29.5 36.5 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 36.9 16.3 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.6l6.3 5.3C41 35.3 44 30 44 24c0-1.3-.2-2.7-.4-4z"/>
    </svg>
  )
}
