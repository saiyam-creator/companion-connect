import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Loader2, ExternalLink, Star, Users, MapPin, Shield, Zap, MessageCircle, ChevronDown } from 'lucide-react'

// ── Floating particle component ──────────────────────────────────────────────
function Particle({ style }) {
  return <div className="absolute rounded-full pointer-events-none" style={style}/>
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = target / 60
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const ACTIVITIES = [
  { emoji:'🎬', label:'Movies',  color:'rgba(168,85,247,0.8)'  },
  { emoji:'💪', label:'Gym',     color:'rgba(34,197,94,0.8)'   },
  { emoji:'✈️', label:'Travel', color:'rgba(59,130,246,0.8)'  },
  { emoji:'📚', label:'Study',   color:'rgba(234,179,8,0.8)'   },
  { emoji:'🍜', label:'Food',    color:'rgba(249,115,22,0.8)'  },
  { emoji:'🎵', label:'Music',   color:'rgba(236,72,153,0.8)'  },
  { emoji:'⚽', label:'Sports',  color:'rgba(6,182,212,0.8)'   },
  { emoji:'🎮', label:'Gaming',  color:'rgba(99,102,241,0.8)'  },
]

const FEATURES = [
  { icon:'🔐', title:'Safe & Verified',     desc:'Community-rated profiles and report system keeps everyone accountable.' },
  { icon:'📍', title:'City-Based Discovery', desc:'Find companions in your exact city — no irrelevant suggestions.' },
  { icon:'✋', title:'Approval-First Chat',  desc:'Chat unlocks only after the host accepts your request. Zero random DMs.' },
  { icon:'⭐', title:'Rating System',        desc:'Rate companions after each activity. Build trust over time.' },
  { icon:'🔔', title:'Live Notifications',   desc:'Instant alerts when someone wants to join or accepts your request.' },
  { icon:'🌍', title:'10+ Categories',       desc:'Movies, gym, travel, food, music, gaming and more.' },
]

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [activeActivity, setActiveActivity] = useState(0)
  const formRef = useRef(null)

  // Rotate activity pill
  useEffect(() => {
    const t = setInterval(() => setActiveActivity(p => (p + 1) % ACTIVITIES.length), 2000)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Fill in all fields')
    setLoading(true)
    try { await login(form.email.trim(), form.password); navigate('/') }
    catch (err) {
      const c = err.code || ''
      toast.error(c.includes('user-not-found') ? 'No account with this email'
        : c.includes('wrong-password') || c.includes('invalid-credential') ? 'Wrong password'
        : c.includes('too-many-requests') ? 'Too many attempts. Try later.'
        : 'Login failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try { await loginWithGoogle(); navigate('/') }
    catch (err) { if (err.code !== 'auth/popup-closed-by-user') toast.error('Google sign-in failed') }
    finally { setGoogleLoading(false) }
  }

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' })

  // Random particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    width: `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: `rgba(249,115,22,${Math.random() * 0.3 + 0.1})`,
    animation: `float ${Math.random() * 4 + 3}s ease-in-out ${Math.random() * 2}s infinite`,
  }))

  return (
    <div className="min-h-screen bg-[#07070a] text-white overflow-x-hidden">

      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Big glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #f97316 0%, transparent 70%)', filter: 'blur(60px)' }}/>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(80px)' }}/>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(80px)' }}/>
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>
          {/* Particles */}
          {particles.map((p, i) => <Particle key={i} style={p}/>)}
        </div>

        {/* Nav */}
        <nav className="absolute top-0 inset-x-0 flex items-center justify-between px-8 py-5 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 flex items-center justify-center shadow-glow-sm">
              <span className="font-black text-white text-lg">C</span>
            </div>
            <div>
              <div className="font-black text-white leading-none text-base">Companion</div>
              <div className="text-[10px] text-zinc-500 leading-none">Connect</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs font-semibold text-zinc-400 hover:text-brand-400 hover:border-brand-500/40 transition-all">
              <Zap size={11} className="text-brand-500"/> ⚡ Sai Tech
            </a>
            <Link to="/signup" className="btn-primary px-4 py-2 text-xs">Get Started</Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/8 mb-8 animate-fade-up">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"/>
            <span className="text-sm font-semibold text-brand-400">Real people · Real activities · Real connections</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-none mb-6 animate-fade-up" style={{ animationDelay:'100ms' }}>
            Find your<br/>
            <span style={{
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 70%, #f97316 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>companion.</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-up" style={{ animationDelay:'200ms' }}>
            No algorithms. No swiping. Just real people doing real things together near you.
          </p>

          {/* Activity pills rotating */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-up" style={{ animationDelay:'300ms' }}>
            {ACTIVITIES.map((a, i) => (
              <span key={a.label}
                className="px-4 py-2 rounded-full text-sm font-bold border transition-all duration-500"
                style={{
                  background: i === activeActivity ? `${a.color.replace('0.8', '0.15')}` : 'rgba(255,255,255,0.03)',
                  borderColor: i === activeActivity ? a.color : 'rgba(255,255,255,0.08)',
                  color: i === activeActivity ? '#fff' : 'rgba(255,255,255,0.4)',
                  transform: i === activeActivity ? 'scale(1.1)' : 'scale(1)',
                }}>
                {a.emoji} {a.label}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay:'400ms' }}>
            <Link to="/signup"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white text-lg transition-all duration-200 active:scale-95 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 20px 40px rgba(249,115,22,0.3)' }}>
              Start for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            <button onClick={scrollToForm}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-zinc-300 border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all text-lg">
              Sign In
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-zinc-600 animate-float">
            <span className="text-xs font-semibold uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown size={20} className="animate-bounce"/>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-y border-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '30px 30px' }}/>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center relative z-10">
          {[
            { n: 10, suffix:'+',  label:'Activity Categories' },
            { n: 100, suffix:'%', label:'Free Forever'        },
            { n: 0,   suffix:'',  label:'Random DMs'          },
            { n: 1,   suffix:'',  label:'App. Built with ❤️'  },
          ].map(({ n, suffix, label }) => (
            <div key={label} className="group">
              <div className="text-4xl sm:text-5xl font-black text-gradient mb-1">
                <Counter target={n} suffix={suffix}/>
              </div>
              <div className="text-sm text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">How it works</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Simple as 1-2-3</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n:'01', icon:'📝', title:'Post an Activity', desc:'Share what you want to do — movie, gym session, food trip, anything. Set your city, time, and preferences.' },
              { n:'02', icon:'✋', title:'Get Join Requests', desc:'Interested people send you a request. Review their profile and ratings, then accept who you vibe with.' },
              { n:'03', icon:'💬', title:'Chat & Meet Up', desc:'Once approved, a private group chat unlocks. Coordinate details and go have a great time!' },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="relative p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-brand-500/30 hover:bg-zinc-900/80 transition-all group">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white text-xs font-black shadow-glow-sm">{n}</div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="text-lg font-black text-white mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-950/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Features</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Built for real connections</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">Every feature designed to make finding companions safe, easy, and genuine.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div key={title}
                className="p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 hover:border-brand-500/20 hover:bg-zinc-900/60 transition-all group animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="font-black text-white mb-1.5 text-[15px]">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / FOUNDER ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: About app */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">About the App</div>
              <h2 className="text-4xl font-black text-white mb-4 leading-tight">
                Why Companion<br/>Connect exists
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Ever wanted to catch a movie, hit the gym, or explore a new café — but had no one to go with? That loneliness is real. Companion Connect was born to solve exactly that.
              </p>
              <p className="text-zinc-500 leading-relaxed mb-6">
                This isn't a dating app. It's a platform for people who want to do things together — platonic, activity-based connections with people who share your interests and are nearby.
              </p>
              <div className="flex flex-wrap gap-2">
                {['🎬 Movies','💪 Fitness','✈️ Travel','📚 Study','🍜 Food','🎵 Music'].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400">{t}</span>
                ))}
              </div>
            </div>

            {/* Right: Founder card */}
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 rounded-3xl opacity-20 blur-3xl"
                style={{ background: 'linear-gradient(135deg, #f97316, #8b5cf6)' }}/>
              <div className="relative p-8 rounded-3xl border border-zinc-800 bg-zinc-900/80">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-orange-600 flex items-center justify-center text-4xl font-black text-white mb-5 shadow-glow">
                  S
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white">Saiyam Jain</h3>
                    <p className="text-zinc-500 text-sm">Full-Stack Developer</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-400 text-xs font-black border border-brand-500/20">Founder</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                  20-year-old BCA student from Muzaffarnagar, UP. Passionate about building products that solve real problems. Companion Connect is his biggest solo project — built with 2 AM debugging sessions and a lot of chai. ☕
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {['React', 'Firebase', 'TailwindCSS', 'Firestore'].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-bold">{t}</span>
                  ))}
                </div>
                <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:border-brand-500/40 hover:bg-zinc-700 transition-all text-sm font-bold text-zinc-300 group">
                  View Portfolio
                  <ExternalLink size={14} className="group-hover:text-brand-400 transition-colors"/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIGN IN FORM ──────────────────────────────────────────────────────── */}
      <section ref={formRef} className="py-24 px-6 bg-zinc-950/80 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #f97316 0%, transparent 70%)', filter:'blur(60px)' }}/>
        </div>
        <div className="max-w-md mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Welcome back 👋</h2>
            <p className="text-zinc-500">Sign in to find your next companion</p>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shadow-2xl">
            {/* Google */}
            <button onClick={handleGoogle} disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 active:scale-[0.98] text-white font-bold text-sm transition-all mb-5 disabled:opacity-60">
              {googleLoading ? <Loader2 size={18} className="animate-spin"/> : <GoogleIcon/>}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-zinc-800"/>
              <span className="text-xs text-zinc-600 font-semibold uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-zinc-800"/>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}/>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input pr-12" placeholder="••••••••"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}/>
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-white text-sm active:scale-[0.98] transition-all disabled:opacity-60"
                style={{ background:'linear-gradient(135deg,#f97316,#ea580c)', boxShadow:'0 10px 30px rgba(249,115,22,0.3)' }}>
                {loading ? <Loader2 size={16} className="animate-spin"/> : <>Sign In <ArrowRight size={15}/></>}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-600 mt-5">
              New here?{' '}
              <Link to="/signup" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">Create free account →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="font-black text-white text-sm">C</span>
            </div>
            <span className="font-black text-zinc-400 text-sm">Companion Connect</span>
          </div>
          <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-brand-400 transition-colors font-semibold">
            <Zap size={11} className="text-brand-500"/> Built by Saiyam Jain · ⚡ Sai Tech
            <ExternalLink size={10}/>
          </a>
        </div>
      </footer>
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
