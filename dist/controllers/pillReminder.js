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
exports.updateIsTaken = exports.getByUserId = exports.create = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const reminder_1 = require("../functions/reminder");
const user_1 = require("../functions/user");
const utils_1 = require("../utils/utils");
const pillReminder_1 = require("../schema/pillReminder");
exports.create = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.user;
    let { endDate } = req.body;
    let formattedEndDate = (0, moment_timezone_1.default)(endDate).add(1, 'day').toISOString();
    req.body.endDate = formattedEndDate;
    try {
        let findUser = yield (0, user_1.findPatientId)(user.email);
        const { patientId, caretakerId } = findUser.data;
        const create = yield (0, reminder_1.createReminder)(caretakerId, patientId, req.body);
        return (0, utils_1.sendResponse)(res, {
            status: 200,
            success: create.success,
            data: create.data,
            error: create.err
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.getByUserId = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const categorize = yield (0, reminder_1.getRemindersToTake)(user.email, user.role, user.id);
        return (0, utils_1.sendResponse)(res, {
            status: 200,
            success: categorize.success,
            data: categorize.data,
            error: categorize.err
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.updateIsTaken = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { reminderId, timingId } = req.body;
    try {
        const reminder = yield pillReminder_1.PillReminder.findOne({ _id: reminderId });
        if (!reminder) {
            return (0, utils_1.sendResponse)(res, {
                status: 404,
                success: false,
                data: null,
                error: 'Reminder not found'
            });
        }
        const timing = reminder.timings.find((t) => t._id.toString() === timingId);
        if (!timing) {
            return (0, utils_1.sendResponse)(res, {
                status: 404,
                success: false,
                data: null,
                error: 'Timing not found'
            });
        }
        timing.isTaken = true;
        const update = yield reminder.save();
        return (0, utils_1.sendResponse)(res, {
            status: 200,
            success: true,
            data: update,
            error: null
        });
    }
    catch (error) {
        next(error);
    }
}));
