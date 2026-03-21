import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <div className="text-6xl mb-6">🌐</div>
      <h1 className="text-3xl font-bold text-zinc-100 mb-2">Page Not Found</h1>
      <p className="text-zinc-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary px-8 py-3">Go Home</Link>
    </div>
  )
}
