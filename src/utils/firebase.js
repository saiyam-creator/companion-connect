import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// ─── Auth helpers ────────────────────────────────────────────────────────────
export const signInWithGoogle     = () => signInWithPopup(auth, googleProvider)
export const signUpWithEmail      = (email, pw) => createUserWithEmailAndPassword(auth, email, pw)
export const signInWithEmail      = (email, pw) => signInWithEmailAndPassword(auth, email, pw)
export const signOutUser          = () => signOut(auth)
export const updateAuthProfile    = (user, data) => updateProfile(user, data)
export { onAuthStateChanged }

// ─── Firestore helpers ───────────────────────────────────────────────────────
export {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
  increment, Timestamp,
}

// ─── Collection refs ─────────────────────────────────────────────────────────
export const usersCol      = () => collection(db, 'users')
export const activitiesCol = () => collection(db, 'activities')
export const messagesCol   = (activityId) => collection(db, 'activities', activityId, 'messages')
export const userDoc       = (uid) => doc(db, 'users', uid)
export const activityDoc   = (id)  => doc(db, 'activities', id)
