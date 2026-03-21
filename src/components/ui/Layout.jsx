import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Home, PlusCircle, User, List, Bell, LogOut, MessageSquare, Zap, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChatContext } from '../../context/ChatContext'
import toast from 'react-hot-toast'

const NAV = [
  { to:'/',              icon:Home,          label:'Explore'       },
  { to:'/chats',         icon:MessageSquare, label:'Messages'      },
  { to:'/create',        icon:PlusCircle,    label:'Post Activity' },
  { to:'/my-activities', icon:List,          label:'My Activities' },
  { to:'/profile',       icon:User,          label:'Profile'       },
]

export default function Layout() {
  const { user, logout, unreadNotifCount } = useAuth()
  const { unreadMsgCount } = useChatContext()
  const navigate = useNavigate()
  const location = useLocation()
  const prevNotifCount = useRef(user?.notifications?.length || 0)
  const isFirstRender = useRef(true)

  // Toast for new notifications
  useEffect(() => {
    const cur = user?.notifications?.length || 0
    if (isFirstRender.current) { prevNotifCount.current = cur; isFirstRender.current = false; return }
    if (cur > prevNotifCount.current) {
      const n = user.notifications[0]
      if (n && !n.read) {
        const icon = n.type === 'accepted' ? '✅' : n.type === 'rejected' ? '❌' : '🔔'
        toast(n.message, { icon, duration: 4000 })
      }
    }
    prevNotifCount.current = cur
  }, [user?.notifications?.length])

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-[240px] fixed inset-y-0 z-40 glass border-r border-zinc-900">

        {/* Logo */}
        <div className="px-4 py-4 border-b border-zinc-900">
          {/* App name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 flex items-center justify-center shadow-glow flex-shrink-0">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <div>
              <div className="text-base font-black text-zinc-100 leading-none">Companion</div>
              <div className="text-xs text-zinc-500 leading-none mt-0.5">Connect</div>
            </div>
          </div>
          {/* Sai Tech badge */}
          <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-brand-500/40 hover:bg-zinc-800 transition-all group w-full">
            <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-glow-sm">
              <Zap size={13} className="text-white fill-white"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-zinc-300 group-hover:text-brand-400 transition-colors leading-none">⚡ Sai Tech</div>
              <div className="text-[10px] text-zinc-600 leading-none mt-0.5">by Saiyam Jain</div>
            </div>
            <ExternalLink size={11} className="text-zinc-700 group-hover:text-brand-400 transition-colors flex-shrink-0"/>
          </a>
        </div>

        {/* User card */}
        <div className="px-3 py-3 border-b border-zinc-900">
          <button onClick={() => navigate('/profile')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 transition-all group">
            <SidebarAvatar name={user?.name} src={user?.avatar}/>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-100 truncate leading-snug">{user?.name}</p>
              <p className="text-[11px] text-zinc-600 truncate">{user?.city}</p>
            </div>
            {user?.isVerified && (
              <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-full border border-brand-500/20">✓</span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-500/12 text-brand-400 border border-brand-500/20 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`
              }>
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={17} className={isActive ? 'text-brand-400' : ''}/>
                    {label === 'Messages' && unreadMsgCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-brand-500 rounded-full text-white text-[9px] flex items-center justify-center font-black">
                        {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                      </span>
                    )}
                  </div>
                  {label}
                </>
              )}
            </NavLink>
          ))}

          {/* Notifications */}
          <NavLink to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive ? 'bg-brand-500/12 text-brand-400 border border-brand-500/20' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`
            }>
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Bell size={17} className={isActive ? 'text-brand-400' : ''}/>
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-brand-500 rounded-full text-white text-[9px] flex items-center justify-center font-black">
                      {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                    </span>
                  )}
                </div>
                Notifications
              </>
            )}
          </NavLink>
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-zinc-900">
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:text-red-400 hover:bg-red-500/8 transition-all">
            <LogOut size={16}/> Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 glass border-t border-zinc-900 z-40 flex safe-area-bottom">
        {[
          { to:'/',              icon:Home,          label:'Explore',  badge:0               },
          { to:'/chats',         icon:MessageSquare, label:'Msgs',     badge:unreadMsgCount  },
          { to:'/create',        icon:PlusCircle,    label:'Post',     badge:0               },
          { to:'/notifications', icon:Bell,          label:'Alerts',   badge:unreadNotifCount},
          { to:'/profile',       icon:User,          label:'Profile',  badge:0               },
        ].map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[10px] font-bold transition-colors ${
                isActive ? 'text-brand-400' : 'text-zinc-600'
              }`
            }>
            <div className="relative">
              <Icon size={20}/>
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-1 bg-brand-500 rounded-full text-white text-[8px] flex items-center justify-center font-black">
                  {badge > 99 ? '99' : badge}
                </span>
              )}
            </div>
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 md:ml-[240px] pb-20 md:pb-0 min-h-screen">
        <Outlet/>
      </main>
    </div>
  )
}

function SidebarAvatar({ name, src, size = 34 }) {
  const colors = ['#f97316','#3b82f6','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308']
  const c = colors[(name?.charCodeAt(0) || 0) % colors.length]
  if (src) return <img src={src} alt={name} style={{ width:size, height:size }} className="rounded-xl object-cover flex-shrink-0 ring-1 ring-zinc-700"/>
  return (
    <div style={{ width:size, height:size, background:`${c}22`, borderColor:`${c}44`, color:c, fontSize:size*0.4 }}
      className="rounded-xl border-2 flex items-center justify-center font-black flex-shrink-0">
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}
