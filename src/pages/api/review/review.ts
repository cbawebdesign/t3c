// pages/api/markReviewed.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  initializeApp,
  cert,
  getApp,
  getApps,
  App
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// — your excelsior-99019 service account from env
const SA = {
  projectId:   process.env.EXCELSIOR_PROJECT_ID!,
  clientEmail: process.env.EXCELSIOR_CLIENT_EMAIL!,
  privateKey:  process.env.EXCELSIOR_PRIVATE_KEY!.replace(/\\n/g, '\n'),
}

// use a named app
const APP_NAME = 'excelsior-data'
let dataApp: App
try {
  dataApp = getApp(APP_NAME)
} catch {
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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { collection, id } = req.body as {
    collection?: string
    id?: string
  }

  if (
    typeof collection !== 'string' ||
    !ALLOWED.includes(collection) ||
    typeof id !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  try {
    // Set reviewed flag + timestamp
    await db
      .collection(collection)
      .doc(id)
      .update({
        reviewed: true,
        reviewedAt: new Date().toISOString(),
      })

    return res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('❌ markReviewed error:', err)
    return res.status(500).json({ error: err.message })
  }
}
