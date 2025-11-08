import express from 'express'
import { createPool } from '../../../core/application/usecases/usecases'
import { pool as dbPool } from '../../../infrastructure/db'
const useInMemory = process.env.USE_IN_MEMORY === 'true'
const { mockPool } = useInMemory ? require('../../../infrastructure/inmemory') : { mockPool: null }

const router = express.Router()

router.post('/', async (req, res) => {
  const { members } = req.body
  try {
    const poolObj = createPool(members)
    const db = useInMemory ? mockPool : dbPool
    const r = await db.query('INSERT INTO pools(payload) VALUES($1) RETURNING id, created_at', [JSON.stringify(poolObj)])
    return res.json({ id: r.rows[0].id, created_at: r.rows[0].created_at, ...poolObj })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  const db = useInMemory ? mockPool : dbPool
  const r = await db.query('SELECT id, created_at, payload FROM pools ORDER BY created_at DESC')
  res.json(r.rows.map((row: any) => ({ id: row.id, created_at: row.created_at, ...row.payload })))
})

export default router
