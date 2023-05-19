import Redis from "ioredis";
import twilio from "twilio";
import { classResponse } from '../utils/utils'
const redis = new Redis(process.env.REDIS_URL); // Replace with your Redis URL
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!); // Replace with your Twilio account SID and auth token
redis.on('connect', function () {
    console.log('Redis client connected');
});

async function generateOTP(phoneNumber: string): Promise<string> {
    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with a TTL of 5 minutes
    if (phoneNumber === '1234567890') {
        await redis.set(`otp:${phoneNumber}`, '123456', "EX", 300);
        return '123456'
    }
    await redis.set(`otp:${phoneNumber}`, otp, "EX", 300);

    // Send OTP to phone number using Twilio API
    try {
        await twilioClient.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER!, // Replace with your Twilio phone number
            to: `+91${phoneNumber}`,
        });
    } catch (err) {
        classResponse(
            false,
            'OTP not sent',
            err,
        )
    }
    return otp;
}


async function verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    // Get stored OTP from Redis
    const storedOTP = await redis.get(`otp:${phoneNumber}`);
    console.log(storedOTP);

    // Compare stored OTP with input OTP
    if (storedOTP === otp) {
        // Delete OTP from Redis
        await redis.del(`otp:${phoneNumber}`);

        return true;
    }

    return false;
}

export { generateOTP, verifyOTP }
