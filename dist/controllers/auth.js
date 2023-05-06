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
exports.sendOtp = exports.login = void 0;
const utils_1 = require("../utils/utils");
const gAuth_1 = require("../services/gAuth");
const auth_1 = require("../functions/auth");
const redis_1 = require("../services/redis");
exports.login = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    try {
        const profile = yield (0, gAuth_1.verifyUser)(idToken);
        const checkEmail = yield (0, auth_1.checkIfEmailExists)(profile.email);
        if (!checkEmail.exists) {
            (0, utils_1.sendResponse)(res, {
                success: true,
                status: 200,
                data: {
                    exists: false
                },
                message: 'User Not Found'
            });
        }
        let response = (0, utils_1.generateJwtToken)(checkEmail.user[0]).data;
        (0, utils_1.sendResponse)(res, {
            success: true,
            status: 200,
            data: response,
            message: 'User Found'
        });
        // check in the database if the user email exists or not
        // if it does not exist, create a new user
    }
    catch (err) {
        next(err);
        // Handle the error here
    }
}));
exports.sendOtp = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber } = req.body;
    try {
        const send = yield (0, redis_1.generateOTP)(phoneNumber);
        console.log(send);
        (0, utils_1.sendResponse)(res, { success: true, message: 'OTP Sent Successfully', status: 200 });
    }
    catch (err) {
        next(err);
    }
}));
