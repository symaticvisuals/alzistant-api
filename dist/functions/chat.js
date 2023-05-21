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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientChatsByCareTaker = exports.getAllChats = exports.createAPIChat = exports.createChat = void 0;
const chat_1 = require("../schema/chat");
const axios_1 = __importDefault(require("axios"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const utils_1 = require("../utils/utils");
const user_1 = require("./user");
const createChat = (message, sender, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const chatMessage = new chat_1.Chat({
        message,
        sentAt: (0, moment_timezone_1.default)().tz('Asia/Kolkata').toDate(),
        sender,
        userEmail,
    });
    yield chatMessage.save();
    return chatMessage;
});
exports.createChat = createChat;
const createAPIChat = (message, email) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.post("https://alzistant.pagekite.me/webhooks/rest/webhook", { sender: email, message }); // Replace 'API_URL' with the actual API endpoint
    // add a 2 second delay to simulate API response time
    console.log(response.data);
    let data = null;
    if (response.data.length > 1) {
        data = response.data[1].text;
    }
    else {
        data = response.data[0].text;
    }
    const chatMessage = new chat_1.Chat({
        message: data,
        sentAt: (0, moment_timezone_1.default)().tz('Asia/Kolkata').toDate(),
        sender: 'chatbot',
        userEmail: email, // Set the user email as needed
    });
    yield chatMessage.save();
    return chatMessage;
});
exports.createAPIChat = createAPIChat;
const getAllChats = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield chat_1.Chat.find({ userEmail: email }).sort({ sentAt: 1 }).lean();
        return chats;
    }
    catch (error) {
        throw error;
    }
});
exports.getAllChats = getAllChats;
const getPatientChatsByCareTaker = (email) => __awaiter(void 0, void 0, void 0, function* () {
    // find the patient email from the careTaker email
    try {
        console.log(email, 'email');
        const findPatientDetails = (0, user_1.fetchPatientDetailsByUserEmail)(email);
        const patientDetails = yield findPatientDetails;
        const patientEmail = patientDetails.data.patients[0].email;
        const chats = yield (0, exports.getAllChats)(patientEmail);
        return (0, utils_1.classResponse)(true, chats, null);
    }
    catch (error) {
        return (0, utils_1.classResponse)(false, null, 'User not found');
    }
});
exports.getPatientChatsByCareTaker = getPatientChatsByCareTaker;
