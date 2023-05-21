"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../../utils/utils");
const user_1 = require("../../controllers/user");
const router = (0, express_1.Router)();
router.route('/add-patient')
    .post(utils_1.verifyJwtToken, user_1.createPatient);
router.route('/find-patients-count')
    .get(utils_1.verifyJwtToken, user_1.findPatientsCount);
router.route('/caretaker')
    .get(utils_1.verifyJwtToken, user_1.findCaretakerByPatientEmail);
exports.default = router;
