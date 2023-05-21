"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../../utils/utils");
const chat_1 = require("../../controllers/chat");
const router = (0, express_1.Router)();
router.route('/')
    .get(utils_1.verifyJwtToken, chat_1.getUserChats)
    .post(utils_1.verifyJwtToken, chat_1.createUserChat);
router.route('/caretaker')
    .post(utils_1.verifyJwtToken, chat_1.createCareTakerChat);
router.route('/patient')
    .get(utils_1.verifyJwtToken, chat_1.getCareTakerChats);
exports.default = router;
