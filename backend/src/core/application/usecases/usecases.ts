import { Route, PoolMember } from '../../domain/entities'
import { computeCB_gCO2ePerMJ, TargetIntensity, energyMJ } from '../../domain/formulas'

export function computeCB(totalEmissions_g: number, route: Route) {
  return computeCB_gCO2ePerMJ(totalEmissions_g, route.fuelConsumption)
}

export function computeComparison(routes: Route[], emissionsByRoute: Record<string, number>) {
  const baseline = routes.find((r) => r.baseline)
  if (!baseline) return []
  const baselineCB = computeCB(emissionsByRoute[baseline.id] || 0, baseline)

  return routes.map((r) => ({ routeId: r.id, cb: computeCB(emissionsByRoute[r.id] || 0, r), delta: computeCB(emissionsByRoute[r.id] || 0, r) - baselineCB }))
}

export function bankSurplus(routes: Route[], emissionsByRoute: Record<string, number>) {
  // Surplus = sum(max(0, TargetIntensity - cb) * energy)
  let surplus_g = 0
  for (const r of routes) {
    const cb = computeCB(emissionsByRoute[r.id] || 0, r)
    const diff = TargetIntensity - cb
    if (diff > 0) {
      surplus_g += diff * energyMJ(r.fuelConsumption)
    }
  }
  return surplus_g
}

export function applyBanked(surplus_g: number, routes: Route[]) {
  // Greedy allocation: apply surplus to worst-performing routes until surplus exhausted.
  const cbByRoute = new Map(routes.map((r) => [r.id, 0]))
  // For demo, distribute proportionally to fuel consumption
  const totalFuel = routes.reduce((s, r) => s + r.fuelConsumption, 0)
  if (totalFuel <= 0) return cbByRoute
  for (const r of routes) {
    const share = r.fuelConsumption / totalFuel
    cbByRoute.set(r.id, share * surplus_g)
  }
  return cbByRoute
}

export function createPool(members: PoolMember[]) {
  // Greedy allocation: sort members by amount desc and allocate
  members.sort((a, b) => b.amount - a.amount)
  const total = members.reduce((s, m) => s + m.amount, 0)
  if (total < 0) throw new Error('Pool sum must be >= 0')
  return { members, total }
}
