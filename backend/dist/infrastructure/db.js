"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initDb = initDb;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Support an in-memory fallback when DATABASE_URL is missing/invalid or when USE_IN_MEMORY=true
const useInMemory = process.env.USE_IN_MEMORY === 'true';
exports.pool = null;
function useMock() {
    // lazy require the in-memory mock to avoid circular deps at import time
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const im = require('./inmemory');
    return im.mockPool;
}
if (useInMemory || !process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL && !useInMemory) {
        console.warn('DATABASE_URL not set — falling back to in-memory mode. Set USE_IN_MEMORY=true to run explicitly in-memory.');
    }
    exports.pool = useMock();
}
else {
    try {
        exports.pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
    }
    catch (err) {
        console.error('Failed to create Postgres pool, falling back to in-memory mock:', err && err.message);
        exports.pool = useMock();
    }
}
async function initDb() {
    // If pool is the in-memory mock, no DB init required
    if (useInMemory || !process.env.DATABASE_URL) {
        return Promise.resolve();
    }
    try {
        await exports.pool.query('SELECT 1');
    }
    catch (err) {
        console.error('Database initialization failed, falling back to in-memory mock:', err.message || err);
        // replace pool with in-memory mock so the rest of the app can continue
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const im = require('./inmemory');
        exports.pool = im.mockPool;
        return Promise.resolve();
    }
}
