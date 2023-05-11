"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("./upload"));
const auth_1 = __importDefault(require("./auth"));
const user_1 = __importDefault(require("./user"));
const reminder_1 = __importDefault(require("./reminder"));
const router = (0, express_1.Router)();
router.use('/upload', upload_1.default);
router.use('/auth', auth_1.default);
router.use('/user', user_1.default);
router.use('/reminder', reminder_1.default);
exports.default = router;
