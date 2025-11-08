"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresRouteRepo = void 0;
const db_1 = require("../../../../infrastructure/db");
class PostgresRouteRepo {
    async list() {
        const res = await db_1.pool.query('SELECT id,name,fuel_consumption,baseline,vessel_type,fuel_type,year FROM routes');
        return res.rows.map((r) => ({ id: r.id, name: r.name, fuelConsumption: r.fuel_consumption, baseline: r.baseline, vesselType: r.vessel_type ?? undefined, fuelType: r.fuel_type ?? undefined, year: r.year ? Number(r.year) : undefined }));
    }
    async findById(id) {
        const res = await db_1.pool.query('SELECT id,name,fuel_consumption,baseline,vessel_type,fuel_type,year FROM routes WHERE id=$1', [id]);
        if (!res.rows[0])
            return null;
        const r = res.rows[0];
        return { id: r.id, name: r.name, fuelConsumption: r.fuel_consumption, baseline: r.baseline, vesselType: r.vessel_type ?? undefined, fuelType: r.fuel_type ?? undefined, year: r.year ? Number(r.year) : undefined };
    }
    async create(r) {
        await db_1.pool.query('INSERT INTO routes(id,name,fuel_consumption,baseline,vessel_type,fuel_type,year) VALUES($1,$2,$3,$4,$5,$6,$7)', [r.id, r.name, r.fuelConsumption, r.baseline, r.vesselType || null, r.fuelType || null, r.year || null]);
    }
    async updateBaseline(id, baseline) {
        if (baseline) {
            // unset existing
            await db_1.pool.query('UPDATE routes SET baseline = false');
        }
        await db_1.pool.query('UPDATE routes SET baseline = $1 WHERE id = $2', [baseline, id]);
    }
    async delete(id) {
        await db_1.pool.query('DELETE FROM routes WHERE id = $1', [id]);
    }
}
exports.PostgresRouteRepo = PostgresRouteRepo;
