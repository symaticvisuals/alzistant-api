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
exports.findPatientsCount = exports.createPatient = void 0;
const utils_1 = require("../utils/utils");
const utils_2 = require("../utils/utils");
const user_1 = require("../functions/user");
exports.createPatient = (0, utils_2.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phone } = req.body;
    try {
        const response = yield (0, user_1.createUserPatient)(email, phone);
        if (!response.success) {
            return (0, utils_1.sendResponse)(res, {
                success: false,
                status: 400,
                data: null,
                message: 'User Already Exists'
            });
        }
        const addtoUser = yield (0, user_1.addpatientIdToUser)(req.user.email, response.data._id);
        if (!addtoUser.success) {
            return (0, utils_1.sendResponse)(res, {
                success: false,
                status: 400,
                data: null,
                message: 'User Already Exists'
            });
        }
        return (0, utils_1.sendResponse)(res, {
            success: true,
            status: 200,
            data: response.data,
            message: 'User Created Successfully'
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.findPatientsCount = (0, utils_2.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { email } = req.user;
    try {
        let findNumer = yield (0, user_1.findNumberOfPatients)(email);
        if (!findNumer.data) {
            return (0, utils_1.sendResponse)(res, {
                success: false,
                status: 200,
                data: null,
                message: 'No Patients Found'
            });
        }
        return (0, utils_1.sendResponse)(res, {
            success: true,
            status: 200,
            data: findNumer.data,
            message: 'Patients Found'
        });
    }
    catch (err) {
        next(err);
    }
}));
