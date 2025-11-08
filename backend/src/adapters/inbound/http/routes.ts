import express from 'express'
import { PostgresRouteRepo } from '../../outbound/postgres/repositories/routeRepo'
import { pool as dbPool } from '../../../infrastructure/db'

const router = express.Router()
const useInMemory = process.env.USE_IN_MEMORY === 'true'
const { mockPool } = useInMemory ? require('../../../infrastructure/inmemory') : { mockPool: null }
const repo: any = useInMemory ? new (require('../../outbound/inmemory/routeRepo').InMemoryRouteRepo)() : new PostgresRouteRepo()

router.get('/', async (req, res) => {
  try {
    const routes = await repo.list()
    res.json(routes)
  } catch (err: any) {
    console.error('GET /routes error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const body = req.body
    await repo.create({ id: body.id, name: body.name, fuelConsumption: body.fuelConsumption, baseline: !!body.baseline, vesselType: body.vesselType, fuelType: body.fuelType, year: body.year })
    res.status(201).send()
  } catch (err: any) {
    console.error('POST /routes error:', err)
    res.status(400).json({ error: err.message || 'Bad request' })
  }
})

router.post('/:id/baseline', async (req, res) => {
  try {
    const { id } = req.params
    await repo.updateBaseline(id, true)
    res.sendStatus(204)
  } catch (err: any) {
    console.error('POST /routes/:id/baseline error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (typeof repo.delete === 'function') {
      await repo.delete(id)
      res.sendStatus(204)
    } else {
      res.status(501).json({ error: 'Delete not implemented for this repository' })
    }
  } catch (err: any) {
    console.error('DELETE /routes/:id error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
})

router.get('/comparison', async (req, res) => {
  try {
    // Simple comparison: compute CB using emissions in an emissions table (if exists)
    const routes = await repo.list()
    const db = useInMemory ? mockPool : dbPool
    const emissionsRes = await db.query('SELECT route_id, total_emissions_g FROM emissions')
    const emissionsByRoute: Record<string, number> = {}
    emissionsRes.rows.forEach((r: any) => (emissionsByRoute[r.route_id] = r.total_emissions_g))
    const { computeComparison } = await import('../../../core/application/usecases/usecases')
    const result = computeComparison(routes, emissionsByRoute)
    res.json(result)
  } catch (err: any) {
    console.error('GET /routes/comparison error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
})

export default router
