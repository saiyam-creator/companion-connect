import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import FeedPage from './pages/FeedPage'
import ActivityDetailPage from './pages/ActivityDetailPage'
import CreateActivityPage from './pages/CreateActivityPage'
import ProfilePage from './pages/ProfilePage'
import MyActivitiesPage from './pages/MyActivitiesPage'
import ChatPage from './pages/ChatPage'
import ChatsPage from './pages/ChatsPage'
import NotificationsPage from './pages/NotificationsPage'
import Layout from './components/ui/Layout'
import NotFoundPage from './pages/NotFoundPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"/>
    </div>
  )
  if (!user) return <Navigate to="/login" replace/>

  // New user — redirect to onboarding (skip if already done or already on onboarding)
  if (!user.onboardingDone) return <Navigate to="/onboarding" replace/>

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace/> : children
}

function OnboardingRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"/>
    </div>
  )
  if (!user) return <Navigate to="/login" replace/>
  // If already onboarded, send to home
  if (user.onboardingDone) return <Navigate to="/" replace/>
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"  element={<PublicRoute><LoginPage/></PublicRoute>}/>
      <Route path="/signup" element={<PublicRoute><SignupPage/></PublicRoute>}/>
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage/></OnboardingRoute>}/>

      <Route element={<PrivateRoute><Layout/></PrivateRoute>}>
        <Route index element={<FeedPage/>}/>
        <Route path="/activity/:id"      element={<ActivityDetailPage/>}/>
        <Route path="/activity/:id/chat" element={<ChatPage/>}/>
        <Route path="/create"            element={<CreateActivityPage/>}/>
        <Route path="/chats"             element={<ChatsPage/>}/>
        <Route path="/notifications"     element={<NotificationsPage/>}/>
        <Route path="/my-activities"     element={<MyActivitiesPage/>}/>
        <Route path="/profile"           element={<ProfilePage/>}/>
        <Route path="/profile/:id"       element={<ProfilePage/>}/>
      </Route>
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ChatProvider>
          <AppRoutes/>
          <Toaster position="top-center" toastOptions={{
            style: { background:'#1f1f26', color:'#f4f4f5', border:'1px solid #2a2a35', borderRadius:'12px', fontSize:'14px' },
            success: { iconTheme: { primary:'#f97316', secondary:'#fff' } },
          }}/>
        </ChatProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}
