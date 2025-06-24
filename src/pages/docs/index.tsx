// pages/docs/index.tsx
import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth'

import configuration from '~/configuration'
import { withTranslationProps } from '~/lib/props/with-translation-props'
import Layout from '~/core/ui/Layout'
import SiteHeader from '~/components/SiteHeader'
import Container from '~/core/ui/Container'
import Footer from '~/components/Footer'

// Firebase config (client-only)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

// PDF entries
const PDF_LIST = [
  { title: 'OBA Documentation', url: 'https://firebasestorage.googleapis.com/v0/b/excelsior-99019.firebasestorage.app/o/OBA%20Monthly%20Script%20Processes%20(1).pdf?alt=media&token=6014b18a-163f-47eb-afaf-6eebbe825f3a' },
  { title: '13H Documentation', url: 'https://firebasestorage.googleapis.com/v0/b/excelsior-99019.firebasestorage.app/o/13H%20%20Processes%20(1).pdf?alt=media&token=066a83d6-32a6-4ed5-8940-04f0778ed3bf' },
  { title: 'Locates Documentation', url: 'https://firebasestorage.googleapis.com/v0/b/excelsior-99019.firebasestorage.app/o/Locate%20Project%20Processes.pdf?alt=media&token=c44461a2-b343-46bd-a0fa-0ec38e726148' },

]

type AuthType = ReturnType<typeof getAuth> | null

export default function DocumentationPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authInstance, setAuthInstance] = useState<AuthType>(null)
  const [selected, setSelected] = useState(PDF_LIST[0])

  useEffect(() => {
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    setAuthInstance(auth)
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async () => {
    if (!authInstance) return
    setAuthError(null)
    try {
      await signInWithEmailAndPassword(authInstance, email, password)
      setEmail(''); setPassword('')
    } catch (e: any) {
      setAuthError(e.message)
    }
  }

  const logout = async () => {
    if (!authInstance) return
    await signOut(authInstance)
    setUser(null)
  }

  if (authLoading || authInstance === null) return <p className="p-6">Checking authentication…</p>
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-200 p-6">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {authError && <p className="text-red-400">{authError}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded" />
        <button onClick={login} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded">Sign In</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-gray-200 flex">
      {/* Sidebar */}
      <nav className="w-1/4 bg-gray-900 p-4">
        <ul className="space-y-2">
          <li><Link href="/dataview" className="block p-2 hover:bg-gray-800 rounded">13H</Link></li>
          <li><Link href="/nystate" className="block p-2 hover:bg-gray-800 rounded">OBA Files</Link></li>
          <li><Link href="/dashboard" className="block p-2 hover:bg-gray-800 rounded">Locates</Link></li>
          <li><Link href="/docs" className="block p-2 bg-gray-700 rounded font-semibold">Documentation</Link></li>
        </ul>
      </nav>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Documentation</h1>
          <div className="flex items-center space-x-4">
            <p className="text-sm">Signed in as {user.email}</p>
            <button onClick={logout} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">Sign Out</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* PDF List */}
          <aside className="lg:w-1/4 bg-gray-900 p-4 rounded">
            <ul className="space-y-2">
              {PDF_LIST.map(doc => (
                <li key={doc.url}>
                  <button onClick={() => setSelected(doc)} className={`w-full text-left p-2 rounded ${selected.url===doc.url?'bg-gray-700':'hover:bg-gray-800'}`}>{doc.title}</button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Preview */}
          <main className="flex-1">
            <div className="bg-white rounded shadow overflow-hidden">
              <iframe src={selected.url} title={selected.title} className="w-full h-[80vh]" />
            </div>
            <div className="mt-4 text-center">
              <a href={selected.url} download target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">Download {selected.title}</a>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps({ locale }: any){
  const { props } = await withTranslationProps({ locale })
  return { props }
}
