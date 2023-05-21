"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCareTakerChats = exports.getUserChats = exports.createCareTakerChat = exports.createUserChat = void 0;
const utils_1 = require("../utils/utils");
const utils_2 = require("../utils/utils");
const chat_1 = require("../functions/chat");
const user_1 = require("../functions/user");
exports.createUserChat = (0, utils_2.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        // Store the user chat
        const userChatMessage = yield (0, chat_1.createChat)(message, 'user', req.user.email);
        // Call the API and store the API chat
        const apiChatMessage = yield (0, chat_1.createAPIChat)(message, req.user.email);
        return (0, utils_1.sendResponse)(res, {
            success: true,
            status: 200,
            data: { userChat: userChatMessage, apiChat: apiChatMessage },
            message: 'Chat message created successfully'
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.createCareTakerChat = (0, utils_2.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        const { email } = req.user;
        // find the patient email from the careTaker email 
        const findPatientDetails = yield (0, user_1.fetchPatientDetailsByUserEmail)(email);
        const patientEmail = findPatientDetails.data.patients[0].email;
        const careTakerChatMessage = yield (0, chat_1.createChat)(message, 'caretaker', patientEmail);
        return (0, utils_1.sendResponse)(res, {
            success: true,
            status: 200,
            data: careTakerChatMessage,
            message: 'Chat message created successfully'
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.getUserChats = (0, utils_2.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.user;
        const userChats = yield (0, chat_1.getAllChats)(email);
        return (0, utils_1.sendResponse)(res, {
            success: true,
            status: 200,
            data: userChats,
            message: 'User chats fetched successfully'
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.getCareTakerChats = (0, utils_2.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.user;
        console.log(email, 'email');
        const patientChats = yield (0, chat_1.getPatientChatsByCareTaker)(email);
        return (0, utils_1.sendResponse)(res, {
            success: true,
            status: 200,
            data: patientChats.data,
            message: 'CareTaker chats fetched successfully'
        });
    }
    catch (error) {
        next(error);
    }
}));
