import {
  db, collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
  increment, Timestamp,
} from './firebase'

// ─── USER ─────────────────────────────────────────────────────────────────────
export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null
}

export const updateUserProfile = (uid, data) =>
  updateDoc(doc(db, 'users', uid), data)

export const blockUser = async (myUid, targetUid) => {
  const me = await getUser(myUid)
  const isBlocked = (me?.blockedUsers || []).includes(targetUid)
  await updateDoc(doc(db, 'users', myUid), {
    blockedUsers: isBlocked ? arrayRemove(targetUid) : arrayUnion(targetUid)
  })
  return !isBlocked
}

export const reportUser = (targetUid) =>
  updateDoc(doc(db, 'users', targetUid), { reportCount: increment(1) })

export const bookmarkActivity = async (uid, activityId) => {
  const me = await getUser(uid)
  const isBookmarked = (me?.bookmarks || []).includes(activityId)
  await updateDoc(doc(db, 'users', uid), {
    bookmarks: isBookmarked ? arrayRemove(activityId) : arrayUnion(activityId)
  })
  return !isBookmarked
}

export const rateUser = (targetUid, rating) =>
  updateDoc(doc(db, 'users', targetUid), {
    rating: increment(rating),
    ratingCount: increment(1),
  })

export const addNotificationToUser = (uid, notif) =>
  updateDoc(doc(db, 'users', uid), {
    notifications: arrayUnion({ ...notif, read: false, createdAt: new Date().toISOString() })
  })

// ─── ACTIVITIES ───────────────────────────────────────────────────────────────
export const createActivity = async (data) => {
  const ref = await addDoc(collection(db, 'activities'), {
    ...data,
    joinRequests: [],
    isExpired: false,
    isDone: false,
    reportedBy: [],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getActivity = async (id) => {
  const snap = await getDoc(doc(db, 'activities', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const updateActivity = (id, data) =>
  updateDoc(doc(db, 'activities', id), data)

export const deleteActivity = (id) =>
  deleteDoc(doc(db, 'activities', id))

// ── Feed: simple query, client-side filter — NO compound index needed ─────────
export const getFeedActivities = async ({ city, category, gender, limitN = 50 }) => {
  // Only use ONE where clause to avoid needing composite indexes
  const q = query(
    collection(db, 'activities'),
    orderBy('createdAt', 'desc'),
    limit(limitN)
  )
  const snap = await getDocs(q)
  const now = new Date()

  let results = snap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Client-side filters — no index needed
  results = results.filter(a => {
    const dt = toDate(a.dateTime)
    if (!dt || dt <= now) return false              // past events out
    if (a.isDone) return false                      // done out
    if (a.isExpired) return false                   // expired out
    // city match (case-insensitive)
    if (city && a.city?.toLowerCase() !== city.toLowerCase()) return false
    // category filter
    if (category && category !== 'all' && a.category !== category) return false
    // gender filter
    if (gender && gender !== 'any') {
      if (a.genderPreference !== 'any' && a.genderPreference !== gender) return false
    }
    return true
  })

  // Sort by dateTime ascending (soonest first)
  results.sort((a, b) => {
    const da = toDate(a.dateTime)?.getTime() || 0
    const db2 = toDate(b.dateTime)?.getTime() || 0
    return da - db2
  })

  return results
}

export const getMyActivities = async (uid) => {
  // Simple single-field query — no composite index needed
  const q = query(collection(db, 'activities'), where('creatorId', '==', uid))
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => toDate(b.createdAt)?.getTime() - toDate(a.createdAt)?.getTime())
}

export const getJoinedActivities = async (uid) => {
  // acceptedUids is an array field we maintain
  const q = query(collection(db, 'activities'), where('acceptedUids', 'array-contains', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getRequestedActivities = async (uid) => {
  const q = query(collection(db, 'activities'), where('requestedUids', 'array-contains', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const sendJoinRequest = async (activityId, user, message = '') => {
  const act = await getActivity(activityId)
  if (!act) throw new Error('Activity not found')
  if (act.isDone || act.isExpired) throw new Error('Activity is no longer active')
  if (act.expiresAt) {
    const exp = toDate(act.expiresAt)
    if (exp && exp < new Date()) throw new Error('Join deadline has passed')
  }
  if (act.creatorId === user.uid) throw new Error('Cannot join your own activity')

  // Check joinRequests array for this user
  const alreadyRequested = (act.joinRequests || []).find(r => r.userId === user.uid)
  if (alreadyRequested) {
    throw new Error(
      alreadyRequested.status === 'pending' ? 'Request already sent — waiting for approval'
      : alreadyRequested.status === 'accepted' ? 'You have already joined this activity'
      : 'Your previous request was declined'
    )
  }

  const acceptedCount = (act.joinRequests || []).filter(r => r.status === 'accepted').length
  if (acceptedCount >= act.maxPeople - 1) throw new Error('Activity is full')

  const newRequest = {
    userId: user.uid,
    userName: user.name,
    userAvatar: user.avatar || '',
    userCity: user.city || '',
    isVerified: user.isVerified || false,
    status: 'pending',
    message,
    requestedAt: new Date().toISOString(),
  }

  // Use spread instead of arrayUnion to avoid Firestore object equality issues
  const updatedRequests = [...(act.joinRequests || []), newRequest]
  const updatedUids = [...new Set([...(act.requestedUids || []), user.uid])]

  await updateDoc(doc(db, 'activities', activityId), {
    joinRequests: updatedRequests,
    requestedUids: updatedUids,
  })

  // Notify creator
  await addNotificationToUser(act.creatorId, {
    message: `${user.name} wants to join "${act.title}"`,
    type: 'join_request',
    activityId,
  })
}

export const respondToRequest = async (activityId, targetUserId, action, activity) => {
  const updatedRequests = (activity.joinRequests || []).map(r =>
    r.userId === targetUserId ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r
  )
  const updates = { joinRequests: updatedRequests }
  if (action === 'accept') updates.acceptedUids = arrayUnion(targetUserId)

  await updateDoc(doc(db, 'activities', activityId), updates)

  const msg = action === 'accept'
    ? `Your request to join "${activity.title}" was accepted! Chat is now available.`
    : `Your request to join "${activity.title}" was declined.`

  await addNotificationToUser(targetUserId, {
    message: msg,
    type: action === 'accept' ? 'accepted' : 'rejected',
    activityId,
  })
}

export const markActivityDone = (activityId, isDone) =>
  updateDoc(doc(db, 'activities', activityId), { isDone })

export const reportActivity = async (activityId, uid) =>
  updateDoc(doc(db, 'activities', activityId), { reportedBy: arrayUnion(uid) })

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const sendMessage = (activityId, sender, content) =>
  addDoc(collection(db, 'activities', activityId, 'messages'), {
    senderId: sender.uid,
    senderName: sender.name,
    senderAvatar: sender.avatar || '',
    content,
    createdAt: serverTimestamp(),
  })

export const subscribeMessages = (activityId, callback) => {
  const q = query(
    collection(db, 'activities', activityId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const subscribeActivity = (activityId, callback) =>
  onSnapshot(doc(db, 'activities', activityId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })

// ─── Helper: Firestore Timestamp or ISO string → JS Date ─────────────────────
export const toDate = (val) => {
  if (!val) return null
  if (val?.toDate) return val.toDate()
  if (val?.seconds) return new Date(val.seconds * 1000)
  return new Date(val)
}
