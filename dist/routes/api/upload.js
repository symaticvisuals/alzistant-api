"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../../controllers/upload");
const router = (0, express_1.Router)();
// router.route('/')
//     .post(verifyJwtToken, addImage as RequestHandler)
router.route('/verify')
    .post(upload_1.verifyImage);
router.route('/delete')
    .delete(upload_1.deleteAllImages);
exports.default = router;
