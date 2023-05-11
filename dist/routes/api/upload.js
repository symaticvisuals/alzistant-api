"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../../controllers/upload");
const router = (0, express_1.Router)();
router.route('/')
    .post(upload_1.addImage);
router.route('/verify')
    .post(upload_1.verifyImage);
exports.default = router;
