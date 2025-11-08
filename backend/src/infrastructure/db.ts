import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Support an in-memory fallback when DATABASE_URL is missing/invalid or when USE_IN_MEMORY=true
const useInMemory = process.env.USE_IN_MEMORY === 'true'

export let pool: any = null

function useMock() {
  // lazy require the in-memory mock to avoid circular deps at import time
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const im: { mockPool: any } = require('./inmemory')
  return im.mockPool
}

if (useInMemory || !process.env.DATABASE_URL) {
  if (!process.env.DATABASE_URL && !useInMemory) {
    console.warn('DATABASE_URL not set — falling back to in-memory mode. Set USE_IN_MEMORY=true to run explicitly in-memory.')
  }
  pool = useMock()
} else {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  } catch (err) {
    console.error('Failed to create Postgres pool, falling back to in-memory mock:', err && (err as any).message)
    pool = useMock()
  }
}

export async function initDb() {
  // If pool is the in-memory mock, no DB init required
  if (useInMemory || !process.env.DATABASE_URL) {
    return Promise.resolve()
  }
  try {
    await pool.query('SELECT 1')
  } catch (err: any) {
    console.error('Database initialization failed, falling back to in-memory mock:', err.message || err)
    // replace pool with in-memory mock so the rest of the app can continue
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const im: { mockPool: any } = require('./inmemory')
    pool = im.mockPool
    return Promise.resolve()
  }
}
