// pages/locates.tsx
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
=======
import React, { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
<<<<<<< HEAD
} from 'firebase/auth';

// ─── Firebase config & init ───────────────────────────────────────
=======
} from 'firebase/auth'

// Firebase configuration
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
const firebaseConfig = {
  apiKey:              process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:       process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:   process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:               process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:       process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
<<<<<<< HEAD
};
initializeApp(firebaseConfig);
const auth = getAuth();

// ─── Helpers ────────────────────────────────────────────────────────
function toArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object') {
    const keys = Object.keys(val);
    if (keys.every((k) => !isNaN(Number(k)))) {
      return keys
        .map((k) => ({ i: Number(k), v: (val as any)[k] }))
        .sort((a, b) => a.i - b.i)
        .map((x) => x.v);
    }
  }
  return [];
}

// ─── Component ─────────────────────────────────────────────────────
export default function LocatesDataViewer() {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [authError, setAuthError]   = useState<string | null>(null);
=======
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Helper to convert numeric-keyed objects into arrays
function toArray(val: any): any[] {
  if (Array.isArray(val)) return val
  if (val && typeof val === 'object') {
    const keys = Object.keys(val)
    if (keys.every(k => !isNaN(Number(k)))) {
      return keys
        .map(k => ({ i: Number(k), v: val[k] }))
        .sort((a, b) => a.i - b.i)
        .map(x => x.v)
    }
  }
  return []
}

export default function LocatesViewer() {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b

  // Data/UI state
  const [startDate, setStartDate]           = useState('');
  const [endDate, setEndDate]               = useState('');
  const [showOnlyUnreviewed, setShowOnlyUnreviewed] = useState(false);
  const [docs, setDocs]           = useState<any[]>([]);
  const [cols, setCols]           = useState<string[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ─── Auth listener ───────────────────────────────────────────────
  useEffect(() => {
<<<<<<< HEAD
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ─── Sign in / out ───────────────────────────────────────────────
  const login = async () => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // ─── Fetch documents ──────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/13h/getCollection?collection=LocatesData';
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());

      let data: any[] = await res.json();
      if (showOnlyUnreviewed) {
        data = data.filter((d) => !d.reviewed);
      }
      setDocs(data);

      // figure out which keys are “scalar”
      const allKeys = Array.from(new Set(data.flatMap((d) => Object.keys(d))));
      const scalarKeys = allKeys.filter(
        (k) =>
          !['reviewed', 'reviewedBy', 'reviewedAt'].includes(k) &&
          !data.some((d) => Array.isArray(d[k]))
      );
      setCols(scalarKeys);
    } catch (e: any) {
      setError(e.message);
      setDocs([]);
      setCols([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Mark reviewed ────────────────────────────────────────────────
  const markReviewed = async (
    docId: string,
    idx: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    if (!user?.email) return;
    if (!confirm('Confirm marking this locate as reviewed?')) return;

    try {
      const res = await fetch('/api/review/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'LocatesData',
          id: docId,
          reviewedBy: user.email,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { reviewedAt } = await res.json();

      setDocs((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          reviewed: true,
          reviewedBy: user.email,
          reviewedAt,
        };
        return next;
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ─── Download CSV ─────────────────────────────────────────────────
  const downloadCSV = (idx: number) => {
    const doc = docs[idx];
    Object.entries(doc).forEach(([field, val]) => {
      const list = toArray(val);
      if (!list.length || typeof list[0] !== 'object') return;

      const headers = Object.keys(list[0] as object);
      const csv =
        headers.join(',') +
        '\r\n' +
        list
          .map((row) =>
            headers
              .map((h) => `"${String((row as any)[h] ?? '').replace(/"/g, '""')}"`)
              .join(',')
          )
          .join('\r\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.id}_${field}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  };

  // ─── Render ───────────────────────────────────────────────────────
  if (authLoading) {
    return <p className="p-6">Checking authentication…</p>;
  }
=======
    const unsub = onAuthStateChanged(auth, u => {
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
  const [cols, setCols] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on demand
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/13h/getCollection?collection=Locates'
      if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      let data: any[] = await res.json()
      if (showOnlyUnreviewed) data = data.filter(d => !d.reviewed)
      setDocs(data)
      // Determine scalar columns
      const allKeys = Array.from(new Set(data.flatMap(d => Object.keys(d))))
      const scalarKeys = allKeys.filter(
        k => !['reviewed','reviewedBy','reviewedAt'].includes(k) &&
             !data.some(d => Array.isArray(d[k]))
      )
      setCols(scalarKeys)
    } catch (e: any) {
      setError(e.message)
      setDocs([])
      setCols([])
    } finally {
      setLoading(false)
    }
  }

  // Mark a locate as reviewed
  const markReviewed = async (
    docId: string,
    idx: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation()
    if (!user?.email) return
    if (!confirm('Confirm marking this locate as reviewed?')) return
    const res = await fetch('/api/review/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: 'Locates', id: docId, reviewedBy: user.email }),
    })
    if (!res.ok) {
      alert(await res.text())
      return
    }
    const { reviewedAt } = await res.json()
    setDocs(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], reviewed: true, reviewedBy: user.email, reviewedAt }
      return next
    })
  }

  // Download CSV for a specific doc
  const downloadCSV = (idx: number) => {
    const doc = docs[idx]
    Object.entries(doc).forEach(([field, val]) => {
      const list = toArray(val)
      if (!list.length || typeof list[0] !== 'object') return
      const headers = Object.keys(list[0])
      const csv = [
        headers.join(','),
        ...list.map(row =>
          headers.map(h => {
            const cell = String((row as any)[h] ?? '')
            return `"${cell.replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `${doc.id}_${field}.csv`)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }

  if (authLoading) return <p className="p-6">Checking authentication…</p>
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
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
<<<<<<< HEAD
            onChange={(e) => setEmail(e.target.value)}
=======
            onChange={e => setEmail(e.target.value)}
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
<<<<<<< HEAD
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
          <button
            onClick={login}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
=======
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
          <button onClick={login} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded">
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
            Sign In
          </button>
        </div>
      </div>
<<<<<<< HEAD
    );
=======
    )
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6">
<<<<<<< HEAD
      {/* header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Locates Data Viewer</h1>
        <div>
=======
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">  
          <h1 className="text-2xl font-bold">Locates Viewer</h1>
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
          <button
            onClick={loadData}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            {loading ? 'Loading…' : 'Load'}
          </button>
<<<<<<< HEAD
          <button
            onClick={logout}
            className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* controls */}
      <div className="flex flex-wrap gap-4 mb-4">
=======
        </div>
        <button onClick={logout} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">
          Sign Out
        </button>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
        <label className="flex flex-col">
          Start Date:
          <input
            type="date"
            value={startDate}
<<<<<<< HEAD
            onChange={(e) => setStartDate(e.target.value)}
=======
            onChange={e => setStartDate(e.target.value)}
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </label>
        <label className="flex flex-col">
          End Date:
          <input
            type="date"
            value={endDate}
<<<<<<< HEAD
            onChange={(e) => setEndDate(e.target.value)}
=======
            onChange={e => setEndDate(e.target.value)}
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyUnreviewed}
<<<<<<< HEAD
            onChange={(e) => setShowOnlyUnreviewed(e.target.checked)}
=======
            onChange={e => setShowOnlyUnreviewed(e.target.checked)}
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
          />
          <span>Only Unreviewed</span>
        </label>
      </div>

<<<<<<< HEAD
      {/* list */}
      <div className="space-y-4">
        {docs.map((doc, i) => (
          <details
            key={doc.id}
            className="bg-gray-900 rounded-lg border border-gray-700"
          >
            <summary className="flex justify-between px-4 py-2 cursor-pointer hover:bg-gray-800">
              <span className="font-medium">{doc.id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadCSV(i);
                }}
=======
      {/* List */}
      <div className="space-y-4">
        {docs.map((doc, i) => (
          <details key={doc.id} className="bg-gray-900 rounded-lg border border-gray-700">
            <summary className="flex justify-between px-4 py-2 cursor-pointer hover:bg-gray-800">
              <span className="font-medium">{doc.id}</span>
              <button
                onClick={e => { e.stopPropagation(); downloadCSV(i) }}
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
              >
                Download CSV
              </button>
            </summary>
            <div className="px-4 py-2 space-y-4 text-xs">
<<<<<<< HEAD
            <div className="flex items-center justify-between text-xs">
  {doc.reviewed ? (
    <span className="text-xs text-green-400">
      Reviewed by {doc.reviewedBy} @ {new Date(doc.reviewedAt).toLocaleString()}
    </span>
  ) : (
    <button
      onClick={(e) => markReviewed(doc.id, i, e)}
      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
    >
      Review
    </button>
  )}
</div>


              {/* scalar fields */}
              <div className="grid grid-cols-2 gap-4">
                {cols.map((key) => (
=======
              <div className="flex justify-end">
                {doc.reviewed ? (
                  <span className="px-3 py-1 bg-gray-700 rounded text-xs cursor-default">Reviewed</span>
                ) : (
                  <button
                    onClick={e => markReviewed(doc.id, i, e)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                  >
                    Review
                  </button>
                )}
              </div>
              {/* Scalar fields */}
              <div className="grid grid-cols-2 gap-4">
                {cols.map(key => (
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
                  <div key={key}>
                    <div className="font-semibold text-gray-400">{key}</div>
                    <div className="text-gray-200">{String((doc as any)[key])}</div>
                  </div>
                ))}
              </div>
<<<<<<< HEAD

              {/* array fields */}
              {Object.entries(doc)
                .filter(([, v]) => Array.isArray(v))
                .map(([field, arr]) => {
                  const rows = arr as Record<string, any>[];
                  const headers = Object.keys(rows[0] || {});
=======
              {/* Array fields */}
              {Object.entries(doc)
                .filter(([, v]) => Array.isArray(v))
                .map(([field, arr]) => {
                  const rows = arr as Record<string, any>[]
                  const headers = Object.keys(rows[0] || {})
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
                  return (
                    <div key={field}>
                      <h3 className="font-semibold text-gray-300 mb-2">{field}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-800">
<<<<<<< HEAD
                              {headers.map((h) => (
                                <th
                                  key={h}
                                  className="border border-gray-700 px-2 py-1 text-left"
                                >
                                  {h}
                                </th>
=======
                              {headers.map(h => (
                                <th key={h} className="border border-gray-700 px-2 py-1 text-left">{h}</th>
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, idx) => (
<<<<<<< HEAD
                              <tr
                                key={idx}
                                className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}
                              >
                                {headers.map((h) => (
                                  <td
                                    key={h}
                                    className="border border-gray-700 px-2 py-1"
                                  >
                                    {String(row[h])}
                                  </td>
=======
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                                {headers.map(h => (
                                  <td key={h} className="border border-gray-700 px-2 py-1">{String(row[h])}</td>
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
<<<<<<< HEAD
                  );
=======
                  )
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
                })}
            </div>
          </details>
        ))}
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
}
