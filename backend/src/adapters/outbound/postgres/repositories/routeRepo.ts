import { Route } from '../../../../core/domain/entities'
import { RouteRepository } from '../../../../core/ports/outbound/repository'
import { pool } from '../../../../infrastructure/db'

export class PostgresRouteRepo implements RouteRepository {
  async list(): Promise<Route[]> {
    const res = await pool.query('SELECT id,name,fuel_consumption,baseline,vessel_type,fuel_type,year FROM routes')
    return res.rows.map((r: any) => ({ id: r.id, name: r.name, fuelConsumption: r.fuel_consumption, baseline: r.baseline, vesselType: r.vessel_type ?? undefined, fuelType: r.fuel_type ?? undefined, year: r.year ? Number(r.year) : undefined }))
  }
  async findById(id: string) {
    const res = await pool.query('SELECT id,name,fuel_consumption,baseline,vessel_type,fuel_type,year FROM routes WHERE id=$1', [id])
    if (!res.rows[0]) return null
    const r = res.rows[0]
    return { id: r.id, name: r.name, fuelConsumption: r.fuel_consumption, baseline: r.baseline, vesselType: r.vessel_type ?? undefined, fuelType: r.fuel_type ?? undefined, year: r.year ? Number(r.year) : undefined }
  }
  async create(r: Route) {
    await pool.query('INSERT INTO routes(id,name,fuel_consumption,baseline,vessel_type,fuel_type,year) VALUES($1,$2,$3,$4,$5,$6,$7)', [r.id, r.name, r.fuelConsumption, r.baseline, (r as any).vesselType || null, (r as any).fuelType || null, (r as any).year || null])
  }
  async updateBaseline(id: string, baseline: boolean) {
    if (baseline) {
      // unset existing
      await pool.query('UPDATE routes SET baseline = false')
    }
    await pool.query('UPDATE routes SET baseline = $1 WHERE id = $2', [baseline, id])
  }
  async delete(id: string) {
    await pool.query('DELETE FROM routes WHERE id = $1', [id])
  }
}
