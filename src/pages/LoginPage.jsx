import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Loader2, Zap, ExternalLink, Github, Twitter } from 'lucide-react'

const FEATURES = [
  { emoji:'🎬', title:'Movie Nights',    sub:'Never watch alone again'       },
  { emoji:'💪', title:'Gym Partners',    sub:'Stay consistent together'      },
  { emoji:'✈️', title:'Travel Buddies', sub:'Split costs, share memories'   },
  { emoji:'📚', title:'Study Groups',    sub:'Learn better with friends'     },
  { emoji:'🍜', title:'Food Crawls',     sub:'Explore the city together'     },
  { emoji:'🎵', title:'Music Events',    sub:'Find your vibe tribe'          },
]

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]             = useState({ email: '', password: '' })
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [googleLoading, setGoogle]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Fill in all fields')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/')
    } catch (err) {
      const code = err.code || ''
      toast.error(
        code.includes('user-not-found') ? 'No account found with this email' :
        code.includes('wrong-password') || code.includes('invalid-credential') ? 'Wrong password' :
        code.includes('too-many-requests') ? 'Too many attempts. Try later.' :
        'Login failed. Check your details.'
      )
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGoogle(true)
    try { await loginWithGoogle(); navigate('/') }
    catch (err) {
      if (err.code !== 'auth/popup-closed-by-user')
        toast.error('Google sign-in failed.')
    } finally { setGoogle(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#09090b]">

      {/* ── LEFT PANEL ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[54%] relative flex-col p-12 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
            style={{ background:'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)' }}/>
          <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full"
            style={{ background:'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)' }}/>
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage:'linear-gradient(rgba(249,115,22,1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,1) 1px, transparent 1px)', backgroundSize:'60px 60px' }}/>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Brand logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <div>
              <div className="font-black text-zinc-100 text-lg leading-none tracking-tight">Companion</div>
              <div className="text-xs text-zinc-600 leading-none mt-0.5 tracking-widest uppercase">Connect</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold mb-6 w-fit">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"/>
              REAL PEOPLE · REAL ACTIVITIES
            </div>

            <h1 className="text-5xl font-black text-zinc-100 leading-[1.05] mb-5 tracking-tight">
              Find companions<br/>
              for every<br/>
              <span className="text-gradient">adventure.</span>
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed mb-10">
              No algorithms. No swiping. Just real people doing real things together near you.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ emoji, title, sub }, i) => (
                <div key={title}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="text-2xl flex-shrink-0">{emoji}</span>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">{title}</div>
                    <div className="text-[11px] text-zinc-600">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Founder credit */}
          <div className="mt-10 pt-6 border-t border-zinc-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/30 to-purple-500/30 border border-brand-500/30 flex items-center justify-center">
                  <span className="text-base">👨‍💻</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-300">Built by Saiyam Jain</div>
                  <div className="text-[11px] text-zinc-600">BCA Final Year · 20 y/o Developer</div>
                </div>
              </div>
              <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all">
                Portfolio <ExternalLink size={11}/>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Auth form ──────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16 relative">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="font-black text-zinc-100">Companion Connect</span>
        </div>

        <div className="w-full max-w-sm mx-auto animate-fade-up">
          <h2 className="text-2xl font-black text-zinc-100 mb-1">Welcome back</h2>
          <p className="text-zinc-500 text-sm mb-8">Sign in to find your next companion</p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-zinc-100 active:scale-[0.98] text-zinc-900 font-bold rounded-2xl transition-all text-sm disabled:opacity-60 shadow-sm mb-5">
            {googleLoading
              ? <Loader2 size={18} className="animate-spin text-zinc-400"/>
              : <GoogleIcon/>
            }
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-800"/>
            <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-zinc-800"/>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" autoComplete="email"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="••••••••" autoComplete="current-password"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}/>
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-[15px] rounded-2xl mt-2">
              {loading
                ? <Loader2 size={17} className="animate-spin"/>
                : <>Sign In <ArrowRight size={16}/></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-7">
            New here?{' '}
            <Link to="/signup" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">
              Create an account
            </Link>
          </p>

          {/* Sai Tech branding */}
          <div className="mt-12 pt-6 border-t border-zinc-800/60 flex items-center justify-center">
            <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-all duration-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-brand-500/40 group-hover:bg-brand-500/5 transition-all duration-300">
                <Zap size={13} className="text-brand-500 group-hover:text-brand-400 transition-colors"/>
                <span className="text-[12px] font-black tracking-tight text-zinc-400 group-hover:text-zinc-200 transition-colors">
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
