"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../../utils/utils");
const router = (0, express_1.Router)();
router.route('/')
    .post(utils_1.verifyJwtToken, (req, res) => {
    res.send('hello');
});
exports.default = router;
