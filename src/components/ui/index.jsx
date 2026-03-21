// Shared reusable UI components

export function Avatar({ name, src, size = 36, className = '' }) {
  const colors = ['#f97316','#3b82f6','#10b981','#8b5cf6','#f43f5e','#06b6d4','#eab308']
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  if (src) return (
    <img src={src} alt={name} style={{ width: size, height: size }}
      className={`rounded-xl object-cover flex-shrink-0 ${className}`} />
  )
  return (
    <div
      style={{ width: size, height: size, backgroundColor: color + '22', borderColor: color + '44', color, fontSize: size * 0.4 }}
      className={`rounded-xl border flex items-center justify-center font-bold flex-shrink-0 ${className}`}
    >
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

const CAT_EMOJIS = {
  Movie: '🎬', Gym: '💪', Travel: '✈️', Study: '📚',
  Food: '🍜', Music: '🎵', Sports: '⚽', Gaming: '🎮',
  Hiking: '🥾', Other: '🎯',
}

export function CategoryBadge({ category, size = 'sm' }) {
  const cls = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs'
  return (
    <span className={`badge cat-${category} ${cls} border`}>
      {CAT_EMOJIS[category] || '🎯'} {category}
    </span>
  )
}

export function StarRating({ value = 0, max = 5, interactive = false, onRate }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          disabled={!interactive}
          onClick={() => interactive && onRate?.(i + 1)}
          className={`text-lg transition-colors ${i < Math.round(value) ? 'text-brand-400' : 'text-zinc-700'} ${interactive ? 'hover:text-brand-300 cursor-pointer' : 'cursor-default'}`}
        >★</button>
      ))}
    </div>
  )
}

export function Spinner({ size = 24, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full border-2 border-brand-500 border-t-transparent animate-spin ${className}`}
    />
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1 text-zinc-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const CAT_EMOJIS_EXPORT = CAT_EMOJIS
