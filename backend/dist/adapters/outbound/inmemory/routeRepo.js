"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRouteRepo = void 0;
const inmemory_1 = require("../../../infrastructure/inmemory");
class InMemoryRouteRepo {
    async list() {
        return inmemory_1.memory.routes.map((r) => ({ id: r.id, name: r.name, fuelConsumption: Number(r.fuel_consumption), baseline: !!r.baseline, vesselType: r.vessel_type, fuelType: r.fuel_type, year: r.year }));
    }
    async findById(id) {
        const r = inmemory_1.memory.routes.find((x) => x.id === id);
        if (!r)
            return null;
        return { id: r.id, name: r.name, fuelConsumption: Number(r.fuel_consumption), baseline: !!r.baseline, vesselType: r.vessel_type, fuelType: r.fuel_type, year: r.year };
    }
    async create(r) {
        inmemory_1.memory.routes.push({ id: r.id, name: r.name, fuel_consumption: r.fuelConsumption, baseline: !!r.baseline, vessel_type: r.vesselType || null, fuel_type: r.fuelType || null, year: r.year || null });
    }
    async updateBaseline(id, baseline) {
        if (baseline)
            inmemory_1.memory.routes.forEach((x) => (x.baseline = false));
        const r = inmemory_1.memory.routes.find((x) => x.id === id);
        if (r)
            r.baseline = baseline;
    }
    async delete(id) {
        const idx = inmemory_1.memory.routes.findIndex((x) => x.id === id);
        if (idx >= 0)
            inmemory_1.memory.routes.splice(idx, 1);
    }
}
exports.InMemoryRouteRepo = InMemoryRouteRepo;
