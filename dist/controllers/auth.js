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
exports.verifyOtp = exports.sendOtp = exports.login = void 0;
const utils_1 = require("../utils/utils");
const gAuth_1 = require("../services/gAuth");
const auth_1 = require("../functions/auth");
const redis_1 = require("../services/redis");
const user_1 = require("../functions/user");
exports.login = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    try {
        const profile = yield (0, gAuth_1.verifyUser)(idToken);
        const checkEmail = yield (0, auth_1.checkIfEmailExists)(profile.email);
        if (!checkEmail.exists) {
            return (0, utils_1.sendResponse)(res, {
                success: true,
                status: 200,
                data: {
                    exists: false
                },
                message: 'User Not Found'
            });
        }
        let user = checkEmail.user[0];
        if (!user.name) {
            user.name = profile.name;
            user.picture = profile.photoUrl;
            const syncData = yield (0, user_1.syncUserData)(user);
            let data = {
                name: syncData.data.name,
                email: syncData.data.email,
                picture: syncData.data.picture,
                mobile: syncData.data.mobile,
                role: syncData.data.role,
            };
            let response = (0, utils_1.generateJwtToken)(data).data;
            return (0, utils_1.sendResponse)(res, {
                success: true,
                status: 200,
                data: response,
                message: 'User Found'
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
    console.log("here");
    const { phoneNumber } = req.body;
    try {
        const send = yield (0, redis_1.generateOTP)(phoneNumber);
        if (!send.success) {
            console.log(send.err);
            return (0, utils_1.sendResponse)(res, { success: false, message: 'OTP Sending Failed', status: 400 });
        }
        console.log(send.data);
        (0, utils_1.sendResponse)(res, { success: true, message: 'OTP Sent Successfully', status: 200 });
    }
    catch (err) {
        next(err);
    }
}));
exports.verifyOtp = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, otp, accessToken } = req.body;
    try {
        const verify = yield (0, redis_1.verifyOTP)(phoneNumber, otp);
        console.log(verify);
        if (!verify) {
            return (0, utils_1.sendResponse)(res, { success: false, message: 'OTP Verification Failed', status: 400 });
        }
        const user = yield (0, gAuth_1.verifyUser)(accessToken);
        const createUser = yield (0, user_1.create)(user, phoneNumber);
        if (!createUser.success) {
            return (0, utils_1.sendResponse)(res, { success: false, message: 'User Creation Failed', status: 400 });
        }
        if (!createUser.data) {
            return (0, utils_1.sendResponse)(res, { success: false, message: 'User Creation Failed', status: 400 });
        }
        const payloadData = {
            name: createUser.data.name,
            email: createUser.data.email,
            picture: createUser.data.picture,
            mobile: createUser.data.mobile,
            role: createUser.data.role,
        };
        const response = (0, utils_1.generateJwtToken)(payloadData).data;
        (0, utils_1.sendResponse)(res, { success: true, message: 'OTP Verified Successfully', status: 200, data: response });
    }
    catch (err) {
        next(err);
    }
}));
