"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@tigrisdata/core");
const connection_1 = require("./connection");
const db = (0, connection_1.getDb)();
// schema definition
const catalogSchema = {
    id: {
        type: core_1.TigrisDataTypes.INT64,
        primary_key: {
            order: 1,
            autoGenerate: true,
        },
    },
    name: { type: core_1.TigrisDataTypes.STRING },
};
const catalog = db.createOrUpdateCollection("catalog", catalogSchema);
exports.default = catalog;
