"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("../../adapters/inbound/http/routes"));
const compliance_1 = __importDefault(require("../../adapters/inbound/http/compliance"));
const banking_1 = __importDefault(require("../../adapters/inbound/http/banking"));
const pools_1 = __importDefault(require("../../adapters/inbound/http/pools"));
const db_1 = require("../../infrastructure/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use('/routes', routes_1.default);
app.use('/compliance', compliance_1.default);
app.use('/banking', banking_1.default);
app.use('/pools', pools_1.default);
const port = process.env.PORT || 4000;
const useInMemory = process.env.USE_IN_MEMORY === 'true';
if (useInMemory) {
    app.listen(port, () => console.log(`Server listening on ${port} (in-memory mode)`));
}
else {
    (0, db_1.initDb)()
        .then(() => {
        app.listen(port, () => console.log(`Server listening on ${port}`));
    })
        .catch((err) => {
        console.error('Failed to init DB:', err.message || err);
        process.exit(1);
    });
}
