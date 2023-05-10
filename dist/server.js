"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import dotenv in this typescript express server
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("./utils/utils");
const routes_1 = __importDefault(require("./routes"));
const connection_1 = require("./db/connection");
const cron_1 = require("./services/cron");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, connection_1.connectDbMiddleware)());
// add cron job here
routes_1.default.forEach((route) => {
    app.use(route.prefix, route.app);
});
app.get('/heartbeat', (req, res) => {
    res.send("404");
});
app.use(utils_1.errorHandler);
app.listen(port, () => {
    (0, cron_1.cronJob)();
    console.log(`[Server]: I am running at https://localhost:${port}`);
});
