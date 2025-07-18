// pages/api/getCollection.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeApp, cert, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// ─── Load service account from environment ───────────────────────
const SA = {
  projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL!,
  privateKey:  process.env.SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
}

const APP_NAME = 'excelsior-data'
let dataApp
try {
  // reuse the named app if it exists
  dataApp = getApp(APP_NAME)
} catch {
  dataApp = initializeApp({ credential: cert(SA) }, APP_NAME)
}
const db = getFirestore(dataApp)

// ─── Allowed collections ────────────────────────────────────────
const ALLOWED = [
  'dailytotals_t3global',
  'dailytotals_t3trading',
  'daily_exceeding_t3global',
  'daily_exceeding_t3trading',
  'monthly_exceeding_t3global',
  'monthly_exceeding_t3trading',
  'OBA',
<<<<<<< HEAD
  'LocatesData',          // ← renamed
=======
  'Locates',
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { collection, date, startDate, endDate } = req.query

  if (typeof collection !== 'string' || !ALLOWED.includes(collection)) {
    return res.status(400).json({ error: 'Collection not allowed' })
  }

  try {
    const colRef = db.collection(collection)
    let docs: any[] = []

    // 1) Single doc by ID or fallback to date field
    if (typeof date === 'string' && date.trim()) {
      const snap = await colRef.doc(date).get()
      if (snap.exists) {
        docs = [{ id: snap.id, ...snap.data() }]
      } else {
        const qSnap = await colRef.where('date', '==', date).get()
        docs = qSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    }
    // 2) Date-range query by __name__ or fallback to date field
    else if (
      typeof startDate === 'string' &&
      typeof endDate === 'string' &&
      startDate.trim() &&
      endDate.trim()
    ) {
      const minD = startDate < endDate ? startDate : endDate
      const maxD = startDate > endDate ? startDate : endDate
      const rangeSnap = await colRef
        .where('__name__', '>=', minD)
        .where('__name__', '<=', maxD)
        .get()
      docs = rangeSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (docs.length === 0) {
        const alt = await colRef
          .where('date', '>=', minD)
          .where('date', '<=', maxD)
          .get()
        docs = alt.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    }
    // 3) Full fetch (capped at 1000)
    else {
      const snap = await colRef.limit(1000).get()
      docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }

<<<<<<< HEAD
    // 4) For LocatesData: collapse top-level numeric keys into rows[]
    if (collection === 'LocatesData') {
=======
    // 4) For Locates: collapse top-level numeric keys into rows[]
    if (collection === 'Locates') {
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
      docs = docs.map(doc => {
        const rows: any[] = []
        const out: any = { id: doc.id }
        for (const [k, v] of Object.entries(doc)) {
          if (/^\d+$/.test(k)) {
            rows.push(v)
          } else if (k !== 'id') {
<<<<<<< HEAD
            out[k] = v    // ← this automatically includes any extra field you have
=======
            out[k] = v
>>>>>>> eff7a4428ac11e26b85b28ef22b2758fae631b2b
          }
        }
        out.rows = rows
        return out
      })
    }

    return res.status(200).json(docs)
  } catch (err: any) {
    console.error('Firestore error:', err)
    return res.status(500).json({ error: err.message })
  }
}
