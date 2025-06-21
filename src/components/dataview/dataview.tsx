// pages/index.tsx
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
  apiKey:              process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:       process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:   process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:               process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:       process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

// initialize Firebase client app
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const COLLECTIONS = [
  'daily_exceeding_t3global',
  'daily_exceeding_t3trading',
  'dailytotals_t3global',
  'dailytotals_t3trading',
  'monthly_exceeding_t3global',
  'monthly_exceeding_t3trading',
]

export default function DataViewer() {
  // ── Auth state ──────────────────────────────────────────────────────
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

  // ── Data & UI state ────────────────────────────────────────────────
  const [collection, setCollection] = useState(COLLECTIONS[0])
  const [date, setDate]             = useState('')
  const [docs, setDocs]             = useState<any[]>([])
  const [cols, setCols]             = useState<string[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `/api/13h/getCollection?collection=${collection}`
      if (date) url += `&date=${date}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setDocs([])
        setCols([])
        setError('No documents found')
      } else {
        setDocs(data)
        const allKeys = Array.from(
          new Set(data.flatMap((d: any) => Object.keys(d)))
        )
        const scalarKeys = allKeys.filter(
          (k) =>
            !['reviewed', 'reviewedBy', 'reviewedAt'].includes(k) &&
            !data.some((d) => Array.isArray(d[k]))
        )
        setCols(scalarKeys)
      }
    } catch (e: any) {
      setDocs([])
      setCols([])
      setError(e.message)
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
    const res = await fetch('/api/review/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection,
        id: docId,
        reviewedBy: user.email,
      }),
    })
    if (!res.ok) {
      alert(await res.text())
      return
    }
    const { reviewedAt } = await res.json()
    setDocs((prev) => {
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        reviewed: true,
        reviewedBy: user.email,
        reviewedAt,
      }
      return next
    })
  }

  // ── Render ─────────────────────────────────────────────────────────
  if (authLoading) {
    return <p className="p-6">Checking authentication…</p>
  }
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
          <button
            onClick={login}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Viewer</h1>
        <div className="flex items-center space-x-4">
          <p className="text-sm">Signed in as {user.email}</p>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <label className="flex flex-col">
          Collection:
          <select
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
          >
            {COLLECTIONS.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          Date:
          <input
            type="date"
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Results */}
      <div className="space-y-6">
        {docs.map((doc, i) => {
          const arrayFields = Object.entries(doc).filter(
            ([, v]) => Array.isArray(v) && (v as any[]).length > 0
          )
          return (
            <details
              key={doc.id}
              className="bg-gray-900 rounded-lg border border-gray-700"
            >
              <summary className="flex justify-between px-4 py-2 cursor-pointer hover:bg-gray-800">
                <span className="font-medium">{doc.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => markReviewed(doc.id, i, e)}
                    disabled={doc.reviewed}
                    className={`px-3 py-1 rounded text-sm ${
                      doc.reviewed
                        ? 'bg-gray-700 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {doc.reviewed ? 'Reviewed' : 'Review'}
                  </button>
                  {doc.reviewed && (
                    <span className="text-xs text-green-400">
                      by {doc.reviewedBy} @{' '}
                      {new Date(doc.reviewedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </summary>

              <div className="px-4 py-2 space-y-4 text-xs">
                {/* Scalar fields grid */}
                <div className="grid grid-cols-2 gap-4">
                  {cols.map((key) => (
                    <div key={key}>
                      <div className="font-semibold text-gray-400">{key}</div>
                      <div className="text-gray-200">{String(doc[key])}</div>
                    </div>
                  ))}
                </div>

                {/* Array fields as tables */}
                {arrayFields.map(([field, arr]) => {
                  const rows = arr as Record<string, any>[]
                  const headers = Object.keys(rows[0] || {})
                  return (
                    <div key={field}>
                      <h3 className="font-semibold text-gray-300 mb-2">
                        {field}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-800">
                              {headers.map((h) => (
                                <th
                                  key={h}
                                  className="border border-gray-700 px-2 py-1 text-left"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, idx) => (
                              <tr
                                key={idx}
                                className={
                                  idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'
                                }
                              >
                                {headers.map((h) => (
                                  <td
                                    key={h}
                                    className="border border-gray-700 px-2 py-1"
                                  >
                                    {String(row[h])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
