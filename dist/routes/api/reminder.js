"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../../utils/utils");
const pillReminder_1 = require("../../controllers/pillReminder");
const router = (0, express_1.Router)();
router.route('/')
    .get(utils_1.verifyJwtToken, pillReminder_1.getByUserId)
    .post(utils_1.verifyJwtToken, pillReminder_1.create);
router.route('/done')
    .post(utils_1.verifyJwtToken, pillReminder_1.updateIsTaken);
exports.default = router;
