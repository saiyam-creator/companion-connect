import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Home, PlusCircle, User, List, Bell, LogOut, MessageSquare, Zap, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChatContext } from '../../context/ChatContext'
import toast from 'react-hot-toast'

export default function Layout() {
  const { user, logout, unreadNotifCount } = useAuth()
  const { unreadMsgCount } = useChatContext()
  const navigate = useNavigate()
  const prevNotifCount = useRef(user?.notifications?.length || 0)
  const isFirst = useRef(true)

  useEffect(() => {
    const cur = user?.notifications?.length || 0
    if (isFirst.current) { prevNotifCount.current = cur; isFirst.current = false; return }
    if (cur > prevNotifCount.current) {
      const n = user.notifications[0]
      if (n && !n.read) toast(n.message, {
        icon: n.type==='accepted'?'✅':n.type==='rejected'?'❌':'🔔', duration:4000
      })
    }
    prevNotifCount.current = cur
  }, [user?.notifications?.length])

  const NAV = [
    { to:'/',              icon:Home,          label:'Explore',       badge:0               },
    { to:'/chats',         icon:MessageSquare, label:'Messages',      badge:unreadMsgCount  },
    { to:'/create',        icon:PlusCircle,    label:'Post Activity', badge:0               },
    { to:'/my-activities', icon:List,          label:'My Activities', badge:0               },
    { to:'/profile',       icon:User,          label:'Profile',       badge:0               },
  ]

  return (
    <div className="flex min-h-screen bg-[#08080c]">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-[220px] fixed inset-y-0 z-40 glass border-r border-white/[0.04]">

        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b border-white/[0.04]">
          {/* App logo */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#f97316,#ea580c)', boxShadow:'0 4px 15px rgba(249,115,22,.3)' }}>
              C
            </div>
            <div>
              <div className="font-black text-white text-sm leading-none">Companion</div>
              <div className="text-[10px] text-zinc-600 leading-none mt-0.5">Connect</div>
            </div>
          </div>

          {/* Sai Tech badge */}
          <a href="https://saiyam-creator.github.io/new-portfolio/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all group w-full"
            style={{ background:'rgba(249,115,22,.06)', border:'1px solid rgba(249,115,22,.12)' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(249,115,22,.12)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(249,115,22,.06)'}>
            <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow:'0 0 10px rgba(249,115,22,.4)' }}>
              <Zap size={11} className="text-white fill-white"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black text-orange-400 leading-none">⚡ Sai Tech</div>
              <div className="text-[9px] text-zinc-600 leading-none mt-0.5">by Saiyam Jain</div>
            </div>
            <ExternalLink size={9} className="text-zinc-700 group-hover:text-orange-400 transition-colors flex-shrink-0"/>
          </a>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-b border-white/[0.04]">
          <button onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group">
            <SidebarAvatar name={user?.name} src={user?.avatar}/>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-100 truncate leading-snug">{user?.name}</p>
              <p className="text-[11px] text-zinc-600 truncate">{user?.city}</p>
            </div>
            {user?.isVerified && (
              <span className="text-[10px] font-black text-brand-400 px-1.5 py-0.5 rounded-full"
                style={{ background:'rgba(249,115,22,.1)', border:'1px solid rgba(249,115,22,.2)' }}>✓</span>
            )}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto scrollbar-hide">
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`
              }
              style={({ isActive }) => isActive ? {
                background:'rgba(249,115,22,.1)',
                border:'1px solid rgba(249,115,22,.15)',
                boxShadow:'inset 0 0 20px rgba(249,115,22,.05)'
              } : { border:'1px solid transparent' }}>
              <div className="relative flex-shrink-0">
                <Icon size={16}/>
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-3.5 px-1 rounded-full text-white text-[8px] flex items-center justify-center font-black"
                    style={{ background:'#f97316' }}>
                    {badge > 99 ? '99' : badge}
                  </span>
                )}
              </div>
              {label}
            </NavLink>
          ))}

          {/* Notifications */}
          <NavLink to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`
            }
            style={({ isActive }) => isActive ? {
              background:'rgba(249,115,22,.1)', border:'1px solid rgba(249,115,22,.15)'
            } : { border:'1px solid transparent' }}>
            <div className="relative flex-shrink-0">
              <Bell size={16}/>
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-3.5 px-1 rounded-full text-white text-[8px] flex items-center justify-center font-black animate-pulse-dot"
                  style={{ background:'#f97316' }}>
                  {unreadNotifCount > 99 ? '99' : unreadNotifCount}
                </span>
              )}
            </div>
            Notifications
          </NavLink>
        </nav>

        {/* Sign out */}
        <div className="px-2.5 py-3 border-t border-white/[0.04]">
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
            <LogOut size={15}/> Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/[0.04] flex">
        {[
          { to:'/',              icon:Home,          label:'Explore',  badge:0               },
          { to:'/chats',         icon:MessageSquare, label:'Messages', badge:unreadMsgCount  },
          { to:'/create',        icon:PlusCircle,    label:'Post',     badge:0               },
          { to:'/notifications', icon:Bell,          label:'Alerts',   badge:unreadNotifCount},
          { to:'/profile',       icon:User,          label:'Me',       badge:0               },
        ].map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} end={to==='/'} className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-bold transition-colors ${
              isActive ? 'text-brand-400' : 'text-zinc-600'
            }`}>
            <div className="relative">
              <Icon size={19}/>
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-1 rounded-full text-white text-[8px] flex items-center justify-center font-black"
                  style={{ background:'#f97316' }}>
                  {badge > 99 ? '99' : badge}
                </span>
              )}
            </div>
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0 min-h-screen">
        <Outlet/>
      </main>
    </div>
  )
}

function SidebarAvatar({ name, src, size = 32 }) {
  const colors = ['#f97316','#3b82f6','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308']
  const c = colors[(name?.charCodeAt(0)||0) % colors.length]
  if (src) return <img src={src} alt={name} style={{width:size,height:size}} className="rounded-xl object-cover flex-shrink-0"/>
  return (
    <div style={{width:size,height:size,background:`${c}18`,border:`1.5px solid ${c}35`,color:c,fontSize:size*.38}}
      className="rounded-xl flex items-center justify-center font-black flex-shrink-0 uppercase">
      {name?.[0]||'?'}
    </div>
  )
}
