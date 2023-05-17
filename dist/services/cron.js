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
exports.cronJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const pillReminder_1 = require("../schema/pillReminder");
const moment_1 = __importDefault(require("moment"));
const updateIsTaken = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = (0, moment_1.default)();
    const reminders = yield pillReminder_1.PillReminder.find({
        endDate: { $gte: now.toDate() }
    });
    reminders.forEach((reminder) => {
        reminder.timings.forEach((timing) => {
            if (timing.isTaken && reminder.toBeTakenToday) {
                timing.isTaken = false;
            }
        });
        reminder.save();
    });
});
const cronJob = () => {
    console.log('Setting up cron job');
    node_cron_1.default.schedule('21 2 * * *', () => {
        console.log('Executing cron job');
        updateIsTaken().then(() => {
            console.log('Cron job completed');
        }).catch((err) => {
            console.error('Error executing cron job:', err);
        });
    });
};
exports.cronJob = cronJob;
