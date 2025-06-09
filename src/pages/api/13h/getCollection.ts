// pages/api/getCollection.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  initializeApp,
  cert,
  getApps,
  getApp,
  App
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// ─── Load your excelsior-99019 service account from env ────────────
const SA = {
  projectId:   process.env.EXCELSIOR_PROJECT_ID!,
  clientEmail: process.env.EXCELSIOR_CLIENT_EMAIL!,
  privateKey:  process.env.EXCELSIOR_PRIVATE_KEY!.replace(/\\n/g, '\n'),
}

// ─── Use a named Admin app to avoid collisions ───────────────────────
const APP_NAME = 'excelsior-data'

let dataApp: App
try {
  dataApp = getApp(APP_NAME)
  console.log('🔁 Reusing existing Admin app:', APP_NAME)
} catch {
  console.log('🚀 Initializing Admin app:', APP_NAME, 'for project', SA.projectId)
  dataApp = initializeApp({ credential: cert(SA) }, APP_NAME)
}

const db = getFirestore(dataApp)

const ALLOWED = [
  'daily_exceeding_t3global',
  'daily_exceeding_t3trading',
  'dailytotals_t3global',
  'dailytotals_t3trading',
  'monthly_exceeding_t3global',
  'monthly_exceeding_t3trading',
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { collection, date } = req.query
  console.log('📬 /api/getCollection called with:', { collection, date })

  // 1️⃣ Validate collection
  if (typeof collection !== 'string' || !ALLOWED.includes(collection)) {
    console.warn('⚠️ Invalid collection:', collection)
    return res.status(400).json({ error: 'Collection not allowed' })
  }

  try {
    let docs: any[] = []

    if (typeof date === 'string' && date.trim()) {
      // 2️⃣ Try fetching by document ID
      console.log(`🔍 Looking up doc("${collection}","${date}")`)
      const snap = await db.collection(collection).doc(date).get()
      console.log('   • snap.exists:', snap.exists)

      if (snap.exists) {
        docs = [{ id: snap.id, ...snap.data() }]
      } else {
        // 3️⃣ Fallback: query on the "date" field
        console.log(`↻ Fallback to where("date","==","${date}")`)
        const qSnap = await db
          .collection(collection)
          .where('date', '==', date)
          .get()
        console.log('   • qSnap.size:', qSnap.size)
        docs = qSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    } else {
      // 4️⃣ No date param: list entire collection + log first 20 IDs
      console.log(`📚 Fetching entire collection "${collection}"`)
      const fullSnap = await db.collection(collection).get()
      console.log('   • total docs:', fullSnap.size)
      console.log(
        '   • first 20 IDs:',
        fullSnap.docs.slice(0, 20).map(d => d.id)
      )
      docs = fullSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    }

    console.log(`✅ Returning ${docs.length} document(s)`)
    return res.status(200).json(docs)
  } catch (err: any) {
    console.error('❌ Firestore error:', err)
    return res.status(500).json({ error: err.message })
  }
}
