"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../../utils/utils");
const relative_1 = require("../../controllers/relative");
const router = (0, express_1.Router)();
router.route('/')
    .get(utils_1.verifyJwtToken, relative_1.getAll)
    .post(utils_1.verifyJwtToken, relative_1.create);
exports.default = router;
