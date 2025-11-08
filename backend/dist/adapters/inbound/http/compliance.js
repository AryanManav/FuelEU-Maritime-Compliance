"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../../../infrastructure/db");
const usecases_1 = require("../../../core/application/usecases/usecases");
const routeRepo_1 = require("../../outbound/postgres/repositories/routeRepo");
const router = express_1.default.Router();
const useInMemory = process.env.USE_IN_MEMORY === 'true';
const { mockPool } = useInMemory ? require('../../../infrastructure/inmemory') : { mockPool: null };
const repo = useInMemory ? new (require('../../outbound/inmemory/routeRepo').InMemoryRouteRepo)() : new routeRepo_1.PostgresRouteRepo();
// POST /compliance/cb — store emissions per route
router.post('/cb', async (req, res) => {
    try {
        const { routeId, total_emissions_g } = req.body;
        const db = useInMemory ? mockPool : db_1.pool;
        await db.query('INSERT INTO emissions(route_id, total_emissions_g) VALUES($1,$2) ON CONFLICT (route_id) DO UPDATE SET total_emissions_g = $2', [routeId, total_emissions_g]);
        res.sendStatus(204);
    }
    catch (err) {
        console.error('POST /compliance/cb error:', err);
        res.status(500).json({ error: err.message || 'Internal error' });
    }
});
// GET /compliance/cb?routeId=... or ?shipId=... — compute per-route CB or fleet surplus
router.get('/cb', async (req, res) => {
    try {
        const routeId = req.query.routeId || req.query.shipId;
        const routes = await repo.list();
        const db = useInMemory ? mockPool : db_1.pool;
        const emissionsRes = await db.query('SELECT route_id, total_emissions_g FROM emissions');
        const emissionsByRoute = {};
        emissionsRes.rows.forEach((r) => (emissionsByRoute[r.route_id] = r.total_emissions_g));
        if (routeId) {
            const route = routes.find((r) => r.id === routeId);
            if (!route)
                return res.status(404).json({ error: 'Route not found' });
            const cb = (0, usecases_1.computeCB)(emissionsByRoute[route.id] || 0, route);
            return res.json({ routeId: route.id, cb });
        }
        // fleet-level surplus (g) and per-route CB
        const perRoute = routes.map((r) => ({ routeId: r.id, cb: (0, usecases_1.computeCB)(emissionsByRoute[r.id] || 0, r) }));
        const surplus_g = (0, usecases_1.bankSurplus)(routes, emissionsByRoute);
        res.json({ surplus_g, perRoute });
    }
    catch (err) {
        console.error('GET /compliance/cb error:', err);
        res.status(500).json({ error: err.message || 'Internal error' });
    }
});
// GET /compliance/adjusted-cb?year=YYYY — compute cb_before and cb_after after applying current bank
router.get('/adjusted-cb', async (req, res) => {
    try {
        const year = req.query.year ? Number(req.query.year) : undefined;
        const routes = await repo.list();
        const db = useInMemory ? mockPool : db_1.pool;
        const emissionsRes = await db.query('SELECT route_id, total_emissions_g FROM emissions');
        const emissionsByRoute = {};
        emissionsRes.rows.forEach((r) => (emissionsByRoute[r.route_id] = r.total_emissions_g));
        // read bank amount (if any)
        const bankRes = await db.query('SELECT amount_g FROM bank LIMIT 1');
        const banked = bankRes.rows[0]?.amount_g || 0;
        // compute cb_before per route
        const rows = routes
            .filter((r) => (year ? r.year === year : true))
            .map((r) => {
            const cb_before = (0, usecases_1.computeCB)(emissionsByRoute[r.id] || 0, r);
            return { routeId: r.id, fuelConsumption: r.fuelConsumption, cb_before };
        });
        // apply banked amount proportionally by fuel consumption
        const totalFuel = rows.reduce((s, r) => s + (r.fuelConsumption || 0), 0);
        const rowsAfter = rows.map((r) => {
            const share = totalFuel > 0 ? (r.fuelConsumption / totalFuel) : 0;
            // convert banked (g) into cb delta (gCO2e/MJ)
            const delta_cb = totalFuel > 0 ? (banked * share) / (r.fuelConsumption * 41000) : 0;
            const cb_after = Math.max(0, r.cb_before - delta_cb);
            return { routeId: r.routeId, cb_before: r.cb_before, cb_after };
        });
        res.json({ banked, routes: rowsAfter });
    }
    catch (err) {
        console.error('GET /compliance/adjusted-cb error:', err);
        res.status(500).json({ error: err.message || 'Internal error' });
    }
});
exports.default = router;
