import { X } from 'lucide-react'

export function Avatar({ name, src, size = 36 }) {
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

export function Spinner({ size = 20 }) {
  return (
    <div style={{ width:size, height:size }}
      className="rounded-full border-2 border-white/10 border-t-brand-500 animate-spin flex-shrink-0"/>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6 animate-fade-up">
      <div className="text-6xl mb-4 animate-float">{icon}</div>
      <h3 className="text-lg font-black text-zinc-200 mb-2">{title}</h3>
      {description && <p className="text-sm text-zinc-600 max-w-xs mb-6 leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-white">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-600 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative card w-full max-w-md p-6 animate-scale-in"
        style={{ background:'rgba(14,14,18,.98)', border:'1px solid rgba(255,255,255,.08)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-white text-base">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 text-zinc-600"><X size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function CategoryBadge({ category }) {
  const CAT_EMOJI = { Movie:'🎬',Gym:'💪',Travel:'✈️',Study:'📚',Food:'🍜',Music:'🎵',Sports:'⚽',Gaming:'🎮',Hiking:'🥾',Other:'🎯' }
  return (
    <span className={`badge border cat-${category} text-xs`}>
      {CAT_EMOJI[category]} {category}
    </span>
  )
}

export function StarRating({ rating, count }) {
  if (!count) return null
  const avg = (rating/count).toFixed(1)
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(n=>(
          <span key={n} className={`text-sm ${n<=Math.round(parseFloat(avg))?'text-brand-400':'text-zinc-700'}`}>★</span>
        ))}
      </div>
      <span className="text-xs font-bold text-zinc-300">{avg}</span>
      <span className="text-xs text-zinc-600">({count})</span>
    </div>
  )
}
