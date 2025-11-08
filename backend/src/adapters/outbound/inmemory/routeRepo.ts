import { memory } from '../../../infrastructure/inmemory'
import { Route } from '../../../core/domain/entities'

export class InMemoryRouteRepo {
  async list(): Promise<Route[]> {
    return memory.routes.map((r: any) => ({ id: r.id, name: r.name, fuelConsumption: Number(r.fuel_consumption), baseline: !!r.baseline, vesselType: r.vessel_type, fuelType: r.fuel_type, year: r.year }))
  }
  async findById(id: string) {
    const r = memory.routes.find((x: any) => x.id === id)
    if (!r) return null
    return { id: r.id, name: r.name, fuelConsumption: Number(r.fuel_consumption), baseline: !!r.baseline, vesselType: r.vessel_type, fuelType: r.fuel_type, year: r.year }
  }
  async create(r: Route) {
    memory.routes.push({ id: r.id, name: r.name, fuel_consumption: r.fuelConsumption, baseline: !!r.baseline, vessel_type: (r as any).vesselType || null, fuel_type: (r as any).fuelType || null, year: (r as any).year || null })
  }
  async updateBaseline(id: string, baseline: boolean) {
    if (baseline) memory.routes.forEach((x: any) => (x.baseline = false))
    const r = memory.routes.find((x: any) => x.id === id)
    if (r) r.baseline = baseline
  }
  async delete(id: string) {
    const idx = memory.routes.findIndex((x: any) => x.id === id)
    if (idx >= 0) memory.routes.splice(idx, 1)
  }
}
