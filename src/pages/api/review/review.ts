import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

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

  const { collection, id, reviewedBy } = req.body as {
    collection?: string
    id?: string
    reviewedBy?: string
  }

  if (
    typeof collection !== 'string' ||
    !ALLOWED.includes(collection) ||
    typeof id !== 'string' ||
    typeof reviewedBy !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  try {
    const reviewedAt = new Date().toISOString()
    await db.collection(collection).doc(id).update({
      reviewed: true,
      reviewedBy,
      reviewedAt,
    })

    return res.status(200).json({ reviewedAt })
  } catch (err: any) {
    console.error('❌ markReviewed error:', err)
    return res.status(500).json({ error: err.message })
  }
}
