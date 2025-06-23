// pages/api/getCollection.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  initializeApp,
  cert,
  getApps,
  getApp,
  App,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Load service account from environment
const SA = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL!,
  privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
}

const APP_NAME = 'excelsior-data'
let dataApp: App

try {
  dataApp = getApp(APP_NAME)
  console.log('🔁 Reusing Firebase app:', APP_NAME)
} catch {
  console.log('🚀 Initializing Firebase app:', APP_NAME)
  dataApp = initializeApp({ credential: cert(SA) }, APP_NAME)
}

const db = getFirestore(dataApp)

// Add OBA and Locates to allowed collections
const ALLOWED = [
  'dailytotals_t3global',
  'dailytotals_t3trading',
  'daily_exceeding_t3global',
  'daily_exceeding_t3trading',
  'monthly_exceeding_t3global',
  'monthly_exceeding_t3trading',
  'OBA',
  'Locates',
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { collection, date, startDate, endDate } = req.query
  console.log('📬 API request:', { collection, date, startDate, endDate })

  if (typeof collection !== 'string' || !ALLOWED.includes(collection)) {
    return res.status(400).json({ error: 'Collection not allowed' })
  }

  try {
    const colRef = db.collection(collection)
    let docs: any[] = []

    // 1) Specific doc by ID or fallback to `date` field
    if (typeof date === 'string' && date.trim()) {
      const snap = await colRef.doc(date).get()
      if (snap.exists) {
        docs = [{ id: snap.id, ...snap.data(), collection }]
      } else {
        const qSnap = await colRef.where('date', '==', date).get()
        docs = qSnap.docs.map((d) => ({ id: d.id, ...d.data(), collection }))
      }
    }

    // 2) Date range query by document ID or by `date` field
    else if (
      typeof startDate === 'string' &&
      typeof endDate === 'string' &&
      startDate.trim() &&
      endDate.trim()
    ) {
      const minDate = startDate < endDate ? startDate : endDate
      const maxDate = startDate > endDate ? startDate : endDate

      console.log(`🔍 Querying IDs between ${minDate} and ${maxDate}`)
      const rangeSnap = await colRef
        .where('__name__', '>=', minDate)
        .where('__name__', '<=', maxDate)
        .get()

      docs = rangeSnap.docs.map((d) => ({ id: d.id, ...d.data(), collection }))

      // fallback to date field if none
      if (docs.length === 0) {
        console.log('↩️ No results by ID. Trying date field instead...')
        const altSnap = await colRef
          .where('date', '>=', minDate)
          .where('date', '<=', maxDate)
          .get()
        docs = altSnap.docs.map((d) => ({ id: d.id, ...d.data(), collection }))
      }
    }

    // 3) Full fetch (limited to 1000 docs)
    else {
      console.log(`📚 Full fetch of ${collection}`)
      const snap = await colRef.limit(1000).get()
      docs = snap.docs.map((d) => ({ id: d.id, ...d.data(), collection }))
    }

    console.log(`✅ Returning ${docs.length} document(s)`)
    return res.status(200).json(docs)
  } catch (err: any) {
    console.error('❌ Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
