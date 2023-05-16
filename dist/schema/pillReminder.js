"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pillReminderSchema = exports.PillReminder = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
moment_timezone_1.default.tz.setDefault("Asia/Kolkata");
const mongoose_1 = __importStar(require("mongoose"));
const pillReminderSchema = new mongoose_1.Schema({
    user: { type: String, ref: "User", required: true, index: true },
    caretakerId: { type: String, ref: "User", index: true },
    timings: [{
            time: { type: String, required: true },
            isTaken: { type: Boolean, default: false },
            momentTime: { type: mongoose_1.Schema.Types.Mixed }
        }],
    medicineName: { type: String, required: true },
    quantity: { type: Number, required: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    frequency: {
        type: String,
        enum: ["daily", "one-day", "alternate"],
        required: true,
    },
    category: { type: String, index: true },
}, { timestamps: true });
exports.pillReminderSchema = pillReminderSchema;
pillReminderSchema.pre('save', function (next) {
    const pillReminder = this;
    pillReminder.timings.forEach((timing) => {
        const momentTime = moment_timezone_1.default.tz(`${pillReminder.startDate.toISOString().substring(0, 10)}T${timing.time}:00.000Z`, 'Asia/Kolkata');
        timing.momentTime = momentTime;
    });
    next();
});
pillReminderSchema.virtual("duration").get(function () {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const durationInDays = Math.round(Math.abs((this.endDate.getTime() - this.startDate.getTime()) / oneDay));
    if (this.frequency === "daily") {
        return durationInDays;
    }
    else if (this.frequency === "one-day") {
        return 1;
    }
    else {
        // If the frequency is alternate, we need to add one extra day to the duration if the
        // duration is an odd number, to account for the extra day in the alternating schedule.
        const duration = Math.ceil(durationInDays / 2);
        return duration % 2 === 0 ? duration : duration + 1;
    }
});
pillReminderSchema.virtual('toBeTakenToday').get(function () {
    const now = (0, moment_timezone_1.default)();
    const isDaily = this.frequency === 'daily';
    const isBeforeEndDate = now.isSameOrBefore((0, moment_timezone_1.default)(this.endDate));
    const isAfterStartDate = now.isSameOrAfter((0, moment_timezone_1.default)(this.startDate));
    if (isDaily && isBeforeEndDate && isAfterStartDate) {
        return true;
    }
    else if (this.frequency === 'one-day' && now.isSame((0, moment_timezone_1.default)(this.startDate), 'day')) {
        return true;
    }
    else if (this.frequency === 'alternate') {
        const diffDays = now.diff((0, moment_timezone_1.default)(this.startDate), 'days');
        return diffDays % 2 === 0;
    }
    else {
        return false;
    }
});
pillReminderSchema.virtual('toBeTakenTomorrow').get(function () {
    const now = (0, moment_timezone_1.default)();
    const tomorrow = (0, moment_timezone_1.default)().add(1, 'day');
    const isDaily = this.frequency === 'daily';
    const isBeforeEndDate = tomorrow.isSameOrBefore((0, moment_timezone_1.default)(this.endDate));
    if (isDaily && isBeforeEndDate) {
        const tomorrowString = tomorrow.format('YYYY-MM-DD');
        return this.timings.some(timing => {
            const reminderTimeString = `${tomorrowString} ${timing.time}`;
            const reminderTime = moment_timezone_1.default.tz(reminderTimeString, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
            return reminderTime.isAfter(now);
        });
    }
    else if (this.frequency === 'one-day' && tomorrow.isSame((0, moment_timezone_1.default)(this.startDate), 'day')) {
        return true;
    }
    else if (this.frequency === 'alternate') {
        const diffDays = tomorrow.diff((0, moment_timezone_1.default)(this.startDate), 'days');
        return diffDays % 2 === 0;
    }
    else {
        return false;
    }
});
pillReminderSchema.virtual('lateTime').get(function () {
    const now = moment_timezone_1.default.tz('Asia/Kolkata');
    const isLate = [];
    this.timings = this.timings.filter((timing) => {
        const timingMoment = moment_timezone_1.default.tz(timing.time, 'HH:mm', 'Asia/Kolkata');
        if (!timing.isTaken && moment_timezone_1.default.duration(now.diff(timingMoment)).asMinutes() >= 10) {
            // also add the date on which the timing is late
            isLate.push(timing);
            return false; // Remove the late timing from the timings array
        }
        return true; // Keep the timing in the timings array
    });
    return isLate;
});
const PillReminder = mongoose_1.default.model("PillReminder", pillReminderSchema);
exports.PillReminder = PillReminder;
