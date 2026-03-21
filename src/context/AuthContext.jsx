import { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  auth, db,
  signInWithGoogle, signUpWithEmail, signInWithEmail, signOutUser,
  updateAuthProfile, onAuthStateChanged, onSnapshot,
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from '../utils/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [fbUser, setFbUser]   = useState(null)
  const [loading, setLoading] = useState(true)
  const skipAuthListener      = useRef(false)
  const userDocUnsub          = useRef(null)  // realtime user doc listener

  // ── Subscribe to user doc realtime ─────────────────────────────────────────
  const subscribeUserDoc = (uid) => {
    // Unsubscribe previous listener if any
    if (userDocUnsub.current) { userDocUnsub.current(); userDocUnsub.current = null }

    const ref = doc(db, 'users', uid)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUser({ uid: snap.id, ...snap.data() })
      }
    }, (err) => {
      console.error('User doc snapshot error:', err)
    })
    userDocUnsub.current = unsub
  }

  // ── Auth state listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (skipAuthListener.current) return

      setFbUser(firebaseUser)

      if (firebaseUser) {
        try {
          const ref = doc(db, 'users', firebaseUser.uid)
          const snap = await getDoc(ref)

          if (snap.exists()) {
            const userData = snap.data()
            // Auto-mark as onboarded if they already have a city (existing users)
            if (!userData.onboardingDone && userData.city && userData.city !== 'Delhi') {
              await updateDoc(ref, { onboardingDone: true })
              userData.onboardingDone = true
            }
            setUser({ uid: firebaseUser.uid, ...userData })
          } else {
            // Google sign-in first time — create doc
            const newUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL || '',
              city: 'Delhi',
              gender: 'prefer_not_to_say',
              age: null,
              bio: '',
              isVerified: false,
              rating: 0,
              ratingCount: 0,
              provider: firebaseUser.providerData[0]?.providerId || 'google',
              notifications: [],
              bookmarks: [],
              blockedUsers: [],
              reportCount: 0,
              createdAt: serverTimestamp(),
            }
            await setDoc(ref, newUser)
            setUser({ ...newUser, uid: firebaseUser.uid })
          }

          // Start realtime listener — updates notifications, bookmarks etc live
          subscribeUserDoc(firebaseUser.uid)
        } catch (e) {
          console.error('Auth state error:', e)
        }
      } else {
        // Logged out — cleanup
        if (userDocUnsub.current) { userDocUnsub.current(); userDocUnsub.current = null }
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      unsub()
      if (userDocUnsub.current) userDocUnsub.current()
    }
  }, [])

  // ── Google sign-in ──────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    const result = await signInWithGoogle()
    return result.user
    // onAuthStateChanged handles doc creation + realtime subscription
  }

  // ── Email sign-up ───────────────────────────────────────────────────────────
  const signup = async ({ name, email, password, age, gender, city }) => {
    skipAuthListener.current = true
    try {
      const cred = await signUpWithEmail(email, password)
      await updateAuthProfile(cred.user, { displayName: name })

      const newUser = {
        uid: cred.user.uid,
        name,
        email,
        avatar: '',
        city: city || 'Delhi',
        gender: gender || 'prefer_not_to_say',
        age: age || null,
        bio: '',
        isVerified: false,
        rating: 0,
        ratingCount: 0,
        provider: 'password',
        notifications: [],
        bookmarks: [],
        blockedUsers: [],
        reportCount: 0,
        createdAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'users', cred.user.uid), newUser)

      setFbUser(cred.user)
      setUser({ ...newUser, uid: cred.user.uid })
      setLoading(false)

      // Start realtime listener
      subscribeUserDoc(cred.user.uid)
      return cred.user
    } finally {
      setTimeout(() => { skipAuthListener.current = false }, 1500)
    }
  }

  // ── Email sign-in ───────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const cred = await signInWithEmail(email, password)
    // onAuthStateChanged → subscribeUserDoc handles the rest
    return cred.user
  }

  // ── Sign out ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (userDocUnsub.current) { userDocUnsub.current(); userDocUnsub.current = null }
    await signOutUser()
    setUser(null)
    setFbUser(null)
    window.location.href = '/login'
  }

  // ── Update user (local + Firestore) ─────────────────────────────────────────
  // NOTE: With onSnapshot active, Firestore writes auto-reflect in state.
  // This function still updates Firestore; onSnapshot picks up the change.
  const updateUser = async (updates) => {
    if (!fbUser?.uid) return
    try {
      await updateDoc(doc(db, 'users', fbUser.uid), updates)
      // onSnapshot will update local state automatically
    } catch (e) {
      // Fallback: update local state directly
      setUser(prev => ({ ...prev, ...updates }))
    }
  }

  // ── Add notification (only for local state, Firestore written via db.js) ────
  // With onSnapshot this is now mostly redundant but kept as fallback
  const addNotification = (notif) => {
    setUser(prev => {
      if (!prev) return prev
      const existing = prev.notifications || []
      const isDupe = existing.some(n =>
        n.message === notif.message &&
        Math.abs(new Date(n.createdAt || 0) - new Date(notif.createdAt || Date.now())) < 3000
      )
      if (isDupe) return prev
      return { ...prev, notifications: [notif, ...existing] }
    })
  }

  const unreadNotifCount = user?.notifications?.filter(n => !n.read).length || 0

  return (
    <AuthContext.Provider value={{
      user, fbUser, loading,
      login, signup, loginWithGoogle, logout,
      updateUser, addNotification, unreadNotifCount,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
