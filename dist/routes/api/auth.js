"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../controllers/auth");
const router = (0, express_1.Router)();
router.route('/')
    .post(auth_1.login);
router.route('/sendOtp')
    .post(auth_1.sendOtp);
exports.default = router;
