"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPool = exports.memory = void 0;
// Simple in-memory DB shim for demo mode
exports.memory = {
    routes: [
        { id: 'R001', name: 'Rotterdam–Antwerp', fuel_consumption: 1000, vessel_type: 'Tanker', fuel_type: 'HFO', year: 2025, baseline: true },
        { id: 'R002', name: 'Hamburg–Gdansk', fuel_consumption: 800, vessel_type: 'Bulk', fuel_type: 'MGO', year: 2025, baseline: false },
        { id: 'R003', name: 'Barcelona–Marseille', fuel_consumption: 600, vessel_type: 'RoRo', fuel_type: 'HFO', year: 2025, baseline: false },
        { id: 'R004', name: 'Copenhagen–Oslo', fuel_consumption: 400, vessel_type: 'Passenger', fuel_type: 'LNG', year: 2025, baseline: false },
        { id: 'R005', name: 'Genoa–Valencia', fuel_consumption: 300, vessel_type: 'Container', fuel_type: 'MGO', year: 2025, baseline: false }
    ],
    emissions: {
    // routeId: total_emissions_g
    },
    bankAmount: 0,
    pools: [],
    nextPoolId: 1
};
exports.mockPool = {
    async query(text, params) {
        // Basic SQL-like handling for the few queries adapters use
        const q = (text || '').toLowerCase();
        if (q.includes('select route_id') && q.includes('from emissions')) {
            const rows = Object.entries(exports.memory.emissions).map(([route_id, total_emissions_g]) => ({ route_id, total_emissions_g }));
            return { rows };
        }
        if (q.startsWith('insert into emissions')) {
            // params: [routeId, totalEmissions]
            const [routeId, totalEmissions] = params || [];
            exports.memory.emissions[routeId] = Number(totalEmissions);
            return { rows: [] };
        }
        if (q.includes('select amount_g from bank')) {
            return { rows: exports.memory.bankAmount ? [{ amount_g: exports.memory.bankAmount }] : [] };
        }
        if (q.startsWith('insert into bank')) {
            exports.memory.bankAmount = Number(params?.[0] || 0);
            return { rows: [] };
        }
        if (q.startsWith('delete from bank')) {
            exports.memory.bankAmount = 0;
            return { rows: [] };
        }
        if (q.startsWith('insert into pools')) {
            const payload = params?.[0];
            const id = exports.memory.nextPoolId++;
            const created_at = new Date().toISOString();
            exports.memory.pools.unshift({ id, created_at, payload: JSON.parse(payload) });
            return { rows: [{ id, created_at }] };
        }
        if (q.includes('select id, created_at, payload from pools')) {
            const rows = exports.memory.pools.map((p) => ({ id: p.id, created_at: p.created_at, payload: p.payload }));
            return { rows };
        }
        // Fallbacks
        return { rows: [] };
    }
};
exports.default = { memory: exports.memory, mockPool: exports.mockPool };
