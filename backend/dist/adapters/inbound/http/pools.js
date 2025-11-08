"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usecases_1 = require("../../../core/application/usecases/usecases");
const db_1 = require("../../../infrastructure/db");
const useInMemory = process.env.USE_IN_MEMORY === 'true';
const { mockPool } = useInMemory ? require('../../../infrastructure/inmemory') : { mockPool: null };
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const { members } = req.body;
    try {
        const poolObj = (0, usecases_1.createPool)(members);
        const db = useInMemory ? mockPool : db_1.pool;
        const r = await db.query('INSERT INTO pools(payload) VALUES($1) RETURNING id, created_at', [JSON.stringify(poolObj)]);
        return res.json({ id: r.rows[0].id, created_at: r.rows[0].created_at, ...poolObj });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.get('/', async (req, res) => {
    const db = useInMemory ? mockPool : db_1.pool;
    const r = await db.query('SELECT id, created_at, payload FROM pools ORDER BY created_at DESC');
    res.json(r.rows.map((row) => ({ id: row.id, created_at: row.created_at, ...row.payload })));
});
exports.default = router;
