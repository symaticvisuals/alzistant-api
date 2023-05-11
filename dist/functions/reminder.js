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
exports.getRemindersToTake = exports.findRemidners = exports.createReminder = void 0;
const pillReminder_1 = require("../schema/pillReminder");
const utils_1 = require("../utils/utils");
const user_1 = require("./user");
const moment_1 = __importDefault(require("moment"));
const createReminder = (caretakerId, patientId, reminder) => __awaiter(void 0, void 0, void 0, function* () {
    const { timings } = reminder;
    // Convert timings from string to Moment object
    const timingsMoment = timings.map(({ time }) => (0, moment_1.default)(time, 'HH:mm'));
    // Create reminder object
    const reminderObj = Object.assign(Object.assign({}, reminder), { caretakerId, user: patientId, timingsMoment });
    const reminderData = new pillReminder_1.PillReminder(reminderObj);
    yield reminderData.validate();
    yield reminderData.save();
    const response = Object.assign(Object.assign({}, reminderData.toObject()), { toBeTakenToday: reminderData.toBeTakenToday, toBeTakenTomorrow: reminderData.toBeTakenTomorrow, duration: reminderData.duration });
    return (0, utils_1.classResponse)(true, response, null);
});
exports.createReminder = createReminder;
const findRemidners = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, user_1.findPatientId)(email);
    const now = (0, moment_1.default)();
    const findRemidners = pillReminder_1.PillReminder.find({
        user: user.data.patientId,
        endDate: { $gte: now.toDate() }
    });
    const reminders = yield findRemidners.exec(); // Await the query execution
    console.log(reminders);
    if (reminders.length === 0) {
        return (0, utils_1.classResponse)(false, null, 'No reminders found');
    }
    // Loop through the reminders and update the fields
    let response = [];
    response = reminders.map((reminder) => {
        return Object.assign(Object.assign({}, reminder.toObject()), { isCompletedToday: reminder.isCompletedToday, duration: reminder.duration, toBeTakenToday: reminder.toBeTakenToday, toBeTakenTomorrow: reminder.toBeTakenTomorrow });
    });
    return (0, utils_1.classResponse)(true, response, null);
});
exports.findRemidners = findRemidners;
const getRemindersToTake = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, user_1.findPatientId)(email);
    const now = (0, moment_1.default)();
    const findRemidners = pillReminder_1.PillReminder.find({
        user: user.data.patientId,
        endDate: { $gte: now.toDate() }
    });
    const reminders = yield findRemidners.exec(); // Await the query execution
    if (reminders.length === 0) {
        return (0, utils_1.classResponse)(false, null, 'No reminders found');
    }
    let tomorrowReminders = reminders.filter((reminder) => {
        return reminder.toBeTakenTomorrow;
    }).map((reminder) => {
        const reminderData = {
            _id: reminder._id,
            medicineName: reminder.medicineName,
            timings: reminder.timings.map((timing) => {
                return { time: timing.time, isTaken: timing.isTaken, _id: timing._id };
            }),
            quantity: reminder.quantity
        };
        return reminderData;
    });
    // Loop through the reminders and update the fields
    let response = reminders.map((reminder) => {
        return Object.assign(Object.assign({}, reminder.toObject()), { isCompletedToday: reminder.isCompletedToday, duration: reminder.duration, toBeTakenToday: reminder.toBeTakenToday, toBeTakenTomorrow: reminder.toBeTakenTomorrow, lateTime: reminder.lateTime, timings: reminder.timings.filter((timing) => {
                var _a;
                return !((_a = reminder.lateTime) === null || _a === void 0 ? void 0 : _a.includes(timing));
            }) });
    });
    // late reminders are those which have late time array length > 0
    let lateReminders = response.filter((reminder) => {
        var _a;
        return ((_a = reminder.lateTime) === null || _a === void 0 ? void 0 : _a.length) > 0 && reminder.toBeTakenToday;
    }).map((reminder) => {
        var _a;
        const reminderData = {
            medicineName: reminder.medicineName,
            lateTime: (_a = reminder.lateTime) === null || _a === void 0 ? void 0 : _a.map((timing) => {
                return { time: timing.time, isTaken: timing.isTaken, _id: timing._id, momentTime: timing.momentTime };
            }),
            quantity: reminder.quantity
        };
        return reminderData;
    });
    let todayReminders = response.filter((reminder) => {
        return reminder.toBeTakenToday && reminder.timings.length > 0;
    }).map((reminder) => {
        const reminderData = {
            medicineName: reminder.medicineName,
            timings: reminder.timings.map((timing) => {
                return { time: timing.time, isTaken: timing.isTaken, _id: timing._id };
            }),
            quantity: reminder.quantity
        };
        return reminderData;
    });
    let nowReminders = [];
    // Check if reminder is within 45 minutes from now or is less than 10 minutes after the reminder time
    response.forEach((reminder) => {
        reminder.timings.forEach((timing) => {
            const time = (0, moment_1.default)(timing, 'HH:mm');
            const diff = time.diff(now, 'minutes');
            if (diff <= 45 && diff >= -10 && !timing.isTaken) {
                nowReminders.push({
                    _id: reminder._id,
                    medicineName: reminder.medicineName,
                    time: timing,
                    quantity: reminder.quantity
                });
            }
        });
    });
    return (0, utils_1.classResponse)(true, { lateReminders, todayReminders, nowReminders, tomorrowReminders }, null);
});
exports.getRemindersToTake = getRemindersToTake;
