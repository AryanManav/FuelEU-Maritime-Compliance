// Simple in-memory DB shim for demo mode
export const memory: any = {
  routes: [
    { id: 'R001', name: 'Rotterdam–Antwerp', fuel_consumption: 1000, vessel_type: 'Tanker', fuel_type: 'HFO', year: 2025, baseline: true },
    { id: 'R002', name: 'Hamburg–Gdansk', fuel_consumption: 800, vessel_type: 'Bulk', fuel_type: 'MGO', year: 2025, baseline: false },
    { id: 'R003', name: 'Barcelona–Marseille', fuel_consumption: 600, vessel_type: 'RoRo', fuel_type: 'HFO', year: 2025, baseline: false },
    { id: 'R004', name: 'Copenhagen–Oslo', fuel_consumption: 400, vessel_type: 'Passenger', fuel_type: 'LNG', year: 2025, baseline: false },
    { id: 'R005', name: 'Genoa–Valencia', fuel_consumption: 300, vessel_type: 'Container', fuel_type: 'MGO', year: 2025, baseline: false }
  ],
  emissions: {
    R001: 3000000000,
    R002: 2500000000,
    R003: 4000000000,
    R004: 1200000000,
    R005: 800000000
  },
  bankAmount: 500000000,
  pools: [
    {
      id: 1,
      created_at: new Date().toISOString(),
      payload: {
        members: [
          { routeId: 'R001', amount: 100000000 },
          { routeId: 'R003', amount: 200000000 }
        ],
        note: 'demo pool'
      }
    }
  ],
  poolMembers: [
    { id: 1, pool_id: 1, route_id: 'R001', amount: 100000000 },
    { id: 2, pool_id: 1, route_id: 'R003', amount: 200000000 }
  ],
  nextPoolId: 2
}

export const mockPool = {
  async query(text: string, params?: any[]) {
    // Basic SQL-like handling for the few queries adapters use
    const q = (text || '').toLowerCase()
    if (q.includes('select route_id') && q.includes('from emissions')) {
      const rows = Object.entries(memory.emissions).map(([route_id, total_emissions_g]) => ({ route_id, total_emissions_g }))
      return { rows }
    }
    if (q.startsWith('insert into emissions')) {
      // params: [routeId, totalEmissions]
      const [routeId, totalEmissions] = params || []
      memory.emissions[routeId] = Number(totalEmissions)
      return { rows: [] }
    }
    if (q.includes('select amount_g from bank')) {
      return { rows: memory.bankAmount ? [{ amount_g: memory.bankAmount }] : [] }
    }
    if (q.startsWith('insert into bank')) {
      memory.bankAmount = Number(params?.[0] || 0)
      return { rows: [] }
    }
    if (q.startsWith('delete from bank')) {
      memory.bankAmount = 0
      return { rows: [] }
    }
    if (q.startsWith('insert into pools')) {
      const payload = params?.[0]
      const id = memory.nextPoolId++
      const created_at = new Date().toISOString()
      memory.pools.unshift({ id, created_at, payload: JSON.parse(payload) })
      return { rows: [{ id, created_at }] }
    }
    if (q.startsWith('insert into pool_members')) {
      // params: [poolId, routeId, amount]
      const [poolId, routeId, amount] = params || []
      const id = memory.poolMembers.length + 1
      memory.poolMembers.push({ id, pool_id: poolId, route_id: routeId, amount: Number(amount) })
      return { rows: [] }
    }
    if (q.includes('select') && q.includes('from pool_members')) {
      // return rows for pool_members queries
      const rows = memory.poolMembers.map((m: any) => ({ id: m.id, pool_id: m.pool_id, route_id: m.route_id, amount: m.amount }))
      return { rows }
    }
    if (q.includes('select id, created_at, payload from pools')) {
      const rows = memory.pools.map((p: any) => ({ id: p.id, created_at: p.created_at, payload: p.payload }))
      return { rows }
    }
    // Fallbacks
    return { rows: [] }
  }
}

export default { memory, mockPool }
