"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routeRepo_1 = require("../../outbound/postgres/repositories/routeRepo");
const db_1 = require("../../../infrastructure/db");
const usecases_1 = require("../../../core/application/usecases/usecases");
const useInMemory = process.env.USE_IN_MEMORY === 'true';
const { mockPool } = useInMemory ? require('../../../infrastructure/inmemory') : { mockPool: null };
const router = express_1.default.Router();
const repo = useInMemory ? require('../../outbound/inmemory/routeRepo').InMemoryRouteRepo && new (require('../../outbound/inmemory/routeRepo').InMemoryRouteRepo)() : new routeRepo_1.PostgresRouteRepo();
// For demo, store banked surplus in a simple table 'bank'
router.get('/bank', async (req, res) => {
    const db = useInMemory ? mockPool : db_1.pool;
    const r = await db.query('SELECT amount_g FROM bank LIMIT 1');
    res.json({ banked: r.rows[0]?.amount_g || 0 });
});
router.post('/bank', async (req, res) => {
    const routes = await repo.list();
    const db = useInMemory ? mockPool : db_1.pool;
    const emissionsRes = await db.query('SELECT route_id, total_emissions_g FROM emissions');
    const emissionsByRoute = {};
    emissionsRes.rows.forEach((r) => (emissionsByRoute[r.route_id] = r.total_emissions_g));
    const surplus = (0, usecases_1.bankSurplus)(routes, emissionsByRoute);
    await db.query('INSERT INTO bank(amount_g) VALUES($1)', [surplus]);
    res.json({ banked: surplus });
});
router.post('/apply', async (req, res) => {
    const db = useInMemory ? mockPool : db_1.pool;
    const r = await db.query('SELECT amount_g FROM bank LIMIT 1');
    const banked = r.rows[0]?.amount_g || 0;
    const routes = await repo.list();
    const allocation = (0, usecases_1.applyBanked)(banked, routes);
    // In a real app, you'd apply allocation adjustments; here we clear bank
    await db.query('DELETE FROM bank');
    res.json({ allocation: Object.fromEntries(allocation) });
});
exports.default = router;
