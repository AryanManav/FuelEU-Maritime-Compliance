import express from 'express'
import { pool as dbPool } from '../../../infrastructure/db'
import { computeCB, bankSurplus } from '../../../core/application/usecases/usecases'
import { PostgresRouteRepo } from '../../outbound/postgres/repositories/routeRepo'

const router = express.Router()
const useInMemory = process.env.USE_IN_MEMORY === 'true'
const { mockPool } = useInMemory ? require('../../../infrastructure/inmemory') : { mockPool: null }
const repo: any = useInMemory ? new (require('../../outbound/inmemory/routeRepo').InMemoryRouteRepo)() : new PostgresRouteRepo()

// POST /compliance/cb — store emissions per route
router.post('/cb', async (req, res) => {
  try {
    const { routeId, total_emissions_g } = req.body
    const db = useInMemory ? mockPool : dbPool
    await db.query('INSERT INTO emissions(route_id, total_emissions_g) VALUES($1,$2) ON CONFLICT (route_id) DO UPDATE SET total_emissions_g = $2', [routeId, total_emissions_g])
    res.sendStatus(204)
  } catch (err: any) {
    console.error('POST /compliance/cb error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
})

// GET /compliance/cb?routeId=... or ?shipId=... — compute per-route CB or fleet surplus
router.get('/cb', async (req, res) => {
  try {
    const routeId = (req.query as any).routeId || (req.query as any).shipId
    const routes = await repo.list()
    const db = useInMemory ? mockPool : dbPool
    const emissionsRes = await db.query('SELECT route_id, total_emissions_g FROM emissions')
    const emissionsByRoute: Record<string, number> = {}
    emissionsRes.rows.forEach((r: any) => (emissionsByRoute[r.route_id] = r.total_emissions_g))

    if (routeId) {
      const route = routes.find((r: any) => r.id === routeId)
      if (!route) return res.status(404).json({ error: 'Route not found' })
      const cb = computeCB(emissionsByRoute[route.id] || 0, route)
      return res.json({ routeId: route.id, cb })
    }

    // fleet-level surplus (g) and per-route CB
    const perRoute = routes.map((r: any) => ({ routeId: r.id, cb: computeCB(emissionsByRoute[r.id] || 0, r) }))
    const surplus_g = bankSurplus(routes, emissionsByRoute)
    res.json({ surplus_g, perRoute })
  } catch (err: any) {
    console.error('GET /compliance/cb error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
})

// GET /compliance/adjusted-cb?year=YYYY — compute cb_before and cb_after after applying current bank
router.get('/adjusted-cb', async (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : undefined
    const routes = await repo.list()
    const db = useInMemory ? mockPool : dbPool
    const emissionsRes = await db.query('SELECT route_id, total_emissions_g FROM emissions')
    const emissionsByRoute: Record<string, number> = {}
    emissionsRes.rows.forEach((r: any) => (emissionsByRoute[r.route_id] = r.total_emissions_g))
    // read bank amount (if any)
    const bankRes = await db.query('SELECT amount_g FROM bank LIMIT 1')
    const banked = bankRes.rows[0]?.amount_g || 0

    // compute cb_before per route
    const rows = routes
      .filter((r: any) => (year ? r.year === year : true))
      .map((r: any) => {
        const cb_before = computeCB(emissionsByRoute[r.id] || 0, r)
        return { routeId: r.id, fuelConsumption: r.fuelConsumption, cb_before }
      })

    // apply banked amount proportionally by fuel consumption
    const totalFuel = rows.reduce((s: number, r: any) => s + (r.fuelConsumption || 0), 0)
    const rowsAfter = rows.map((r: any) => {
      const share = totalFuel > 0 ? (r.fuelConsumption / totalFuel) : 0
      // convert banked (g) into cb delta (gCO2e/MJ)
      const delta_cb = totalFuel > 0 ? (banked * share) / (r.fuelConsumption * 41000) : 0
      const cb_after = Math.max(0, r.cb_before - delta_cb)
      return { routeId: r.routeId, cb_before: r.cb_before, cb_after }
    })

    res.json({ banked, routes: rowsAfter })
  } catch (err: any) {
    console.error('GET /compliance/adjusted-cb error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
})

export default router
