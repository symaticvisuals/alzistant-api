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
exports.verifyOTP = exports.generateOTP = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const twilio_1 = __importDefault(require("twilio"));
const redis = new ioredis_1.default(process.env.REDIS_URL); // Replace with your Redis URL
const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN); // Replace with your Twilio account SID and auth token
redis.on('connect', function () {
    console.log('Redis client connected');
});
function generateOTP(phoneNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Store OTP in Redis with a TTL of 5 minutes
        yield redis.set(`otp:${phoneNumber}`, otp, "EX", 300);
        // Send OTP to phone number using Twilio API
        yield twilioClient.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });
        return otp;
    });
}
exports.generateOTP = generateOTP;
function verifyOTP(phoneNumber, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get stored OTP from Redis
        const storedOTP = yield redis.get(`otp:${phoneNumber}`);
        // Compare stored OTP with input OTP
        if (storedOTP === otp) {
            // Delete OTP from Redis
            yield redis.del(`otp:${phoneNumber}`);
            return true;
        }
        return false;
    });
}
exports.verifyOTP = verifyOTP;
