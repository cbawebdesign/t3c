// pages/oba.tsx
import React, { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

<<<<<<< HEAD
initializeApp(firebaseConfig)
const auth = getAuth()
=======
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b

export default function OBAViewer() {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async () => {
    setAuthError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setEmail('')
      setPassword('')
    } catch (e: any) {
      setAuthError(e.message)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  // Data & UI state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showOnlyUnreviewed, setShowOnlyUnreviewed] = useState(false)
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/13h/getCollection?collection=OBA'
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`
      }
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      let data = await res.json()
<<<<<<< HEAD
      if (showOnlyUnreviewed) {
        data = data.filter((d: any) => !d.reviewed)
      }
=======
      if (showOnlyUnreviewed) data = data.filter((d: any) => !d.reviewed)
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
      setDocs(data)
    } catch (e: any) {
      setError(e.message)
      setDocs([])
    } finally {
      setLoading(false)
    }
  }

  const markReviewed = async (
    docId: string,
    idx: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation()
    if (!user?.email) return
    const confirmed = confirm('Do you confirm reviewing this file?')
    if (!confirmed) return
    const res = await fetch('/api/review/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: 'OBA', id: docId, reviewedBy: user.email }),
    })
    if (!res.ok) {
      alert(await res.text())
      return
    }
    const { reviewedAt } = await res.json()
    setDocs((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], reviewed: true, reviewedBy: user.email, reviewedAt }
      return updated
    })
  }

  useEffect(() => {
    if (user) loadData()
  }, [user])

  if (authLoading) return <p className="p-6">Checking authentication…</p>
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-200 p-6">
        <div className="max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold">Sign In</h1>
          {authError && <p className="text-red-400">{authError}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
          <button onClick={login} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6">
      {/* Header */}
<<<<<<< HEAD
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">OBA Files</h1>
        <div className="flex items-center gap-4">
          <button onClick={loadData} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
            {loading ? 'Loading…' : 'Refresh'}
          </button>
=======
      <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">OBA Files</h1>
          <button onClick={loadData} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        <div className="flex items-center gap-4">
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
          <p className="text-sm">Signed in as {user.email}</p>
          <button onClick={logout} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">
            Sign Out
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <label className="flex flex-col">
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </label>
        <label className="flex flex-col">
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyUnreviewed}
            onChange={(e) => setShowOnlyUnreviewed(e.target.checked)}
          />
          <span>Only Unreviewed</span>
        </label>
      </div>

      {/* List */}
      <div className="space-y-4">
        {docs.map((doc, i) => (
          <details key={doc.id} className="bg-gray-900 rounded-lg border border-gray-700">
            <summary className="flex justify-between px-4 py-2 cursor-pointer hover:bg-gray-800">
<<<<<<< HEAD
              <div className="flex items-center space-x-4">
                {/* Show the human-friendly file name */}
                <span className="font-medium">{doc.name}</span>
                {/* Show Month and Year in bold */}
                <span className="font-semibold">Month: {doc.Month}</span>
                <span className="font-semibold">Year: {doc.Year}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(doc.downloadURL!, '_blank')
                }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
              >
=======
              <span className="font-medium">{doc.id}</span>
              <button onClick={(e) => { e.stopPropagation(); window.open(doc.downloadURL!, '_blank') }} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
                Download File
              </button>
            </summary>
            <div className="px-4 py-2 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <button
                  onClick={(e) => markReviewed(doc.id, i, e)}
                  disabled={doc.reviewed}
<<<<<<< HEAD
                  className={`px-3 py-1 rounded text-sm transition transform ${
                    doc.reviewed ? 'bg-gray-700 cursor-default' : 'bg-blue-600 hover:bg-blue-700 scale-110'
                  }`}
                >
                  {doc.reviewed ? 'Reviewed' : 'Review'}
                </button>
                {doc.reviewed && (
                  <span className="text-xs text-green-400">
                    by {doc.reviewedBy} @ {new Date(doc.reviewedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <p>
                <strong>Month:</strong> {doc.Month}
              </p>
              <p>
                <strong>Year:</strong> {doc.Year}
              </p>
=======
                  className={`px-3 py-1 rounded text-sm transition transform ${doc.reviewed ? 'bg-gray-700 cursor-default' : 'bg-blue-600 hover:bg-blue-700 scale-110'}`}>
                  {doc.reviewed ? 'Reviewed' : 'Review'}
                </button>
                {doc.reviewed && <span className="text-xs text-green-400">by {doc.reviewedBy} @ {new Date(doc.reviewedAt).toLocaleString()}</span>}
              </div>
              <p><strong>Month:</strong> {doc.Month}</p>
              <p><strong>Year:</strong> {doc.Year}</p>
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
