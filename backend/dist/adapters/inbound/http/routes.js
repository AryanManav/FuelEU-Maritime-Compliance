"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routeRepo_1 = require("../../outbound/postgres/repositories/routeRepo");
const db_1 = require("../../../infrastructure/db");
const router = express_1.default.Router();
const useInMemory = process.env.USE_IN_MEMORY === 'true';
const { mockPool } = useInMemory ? require('../../../infrastructure/inmemory') : { mockPool: null };
const repo = useInMemory ? new (require('../../outbound/inmemory/routeRepo').InMemoryRouteRepo)() : new routeRepo_1.PostgresRouteRepo();
router.get('/', async (req, res) => {
    try {
        const routes = await repo.list();
        res.json(routes);
    }
    catch (err) {
        console.error('GET /routes error:', err);
        res.status(500).json({ error: err.message || 'Internal error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        await repo.create({ id: body.id, name: body.name, fuelConsumption: body.fuelConsumption, baseline: !!body.baseline, vesselType: body.vesselType, fuelType: body.fuelType, year: body.year });
        res.status(201).send();
    }
    catch (err) {
        console.error('POST /routes error:', err);
        res.status(400).json({ error: err.message || 'Bad request' });
    }
});
router.post('/:id/baseline', async (req, res) => {
    try {
        const { id } = req.params;
        await repo.updateBaseline(id, true);
        res.sendStatus(204);
    }
    catch (err) {
        console.error('POST /routes/:id/baseline error:', err);
        res.status(500).json({ error: err.message || 'Internal error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof repo.delete === 'function') {
            await repo.delete(id);
            res.sendStatus(204);
        }
        else {
            res.status(501).json({ error: 'Delete not implemented for this repository' });
        }
    }
    catch (err) {
        console.error('DELETE /routes/:id error:', err);
        res.status(500).json({ error: err.message || 'Internal error' });
    }
});
router.get('/comparison', async (req, res) => {
    try {
        // Simple comparison: compute CB using emissions in an emissions table (if exists)
        const routes = await repo.list();
        const db = useInMemory ? mockPool : db_1.pool;
        const emissionsRes = await db.query('SELECT route_id, total_emissions_g FROM emissions');
        const emissionsByRoute = {};
        emissionsRes.rows.forEach((r) => (emissionsByRoute[r.route_id] = r.total_emissions_g));
        const { computeComparison } = await Promise.resolve().then(() => __importStar(require('../../../core/application/usecases/usecases')));
        const result = computeComparison(routes, emissionsByRoute);
        res.json(result);
    }
    catch (err) {
        console.error('GET /routes/comparison error:', err);
        res.status(500).json({ error: err.message || 'Internal error' });
    }
});
exports.default = router;
