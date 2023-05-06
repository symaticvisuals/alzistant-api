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
exports.asyncMiddleware = exports.generateJwtToken = exports.verifyJwtToken = exports.verifyRoles = exports.sendResponse = exports.errorHandler = exports.getMessageBody = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Constants = require('./Constants');
const asyncMiddleware = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncMiddleware = asyncMiddleware;
const classResponse = (success, data, err) => {
    return {
        success,
        data,
        err,
    };
};
const generateJwtToken = (payload) => {
    let { name, picture, role, mobile, email } = payload;
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return classResponse(true, {
        token: token,
        profile: {
            name, picture, role, mobile, email
        },
    }, null);
};
exports.generateJwtToken = generateJwtToken;
const verifyJwtToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        return res.status(401).json({
            success: false,
            data: null,
            error: "No authorization token",
        });
    }
    const token = req.headers.authorization.split(" ")[1];
    try {
        req.user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            data: null,
            error: "Invalid authorization token",
        });
    }
});
exports.verifyJwtToken = verifyJwtToken;
const verifyRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            data: null,
            error: Constants.UNAUTHORIZED,
        });
    }
    if (req.user.roles.includes(Constants.ADMIN)) {
        next();
    }
    else {
        return res.status(403).json({
            success: false,
            data: null,
            error: "Forbidden",
        });
    }
});
exports.verifyRoles = verifyRoles;
function sendResponse(res, { status, message = "", success = true, data = null, error }) {
    const responseData = { status, success, message, data, error };
    if (responseData.error) {
        res.status(responseData.status).json({ error: responseData.error });
    }
    else {
        res.status(responseData.status).json(responseData);
    }
}
exports.sendResponse = sendResponse;
const errorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Error in errorHandler: ", req.url, req.body, err);
        let response = {
            success: false,
            data: null,
            error: err || "Something went wrong",
        };
        res.send(response);
    }
    catch (err) {
        next(err);
    }
});
exports.errorHandler = errorHandler;
const getMessageBody = (message, email, subject) => {
    const messageBody = `Dear support team,

I am writing to inquire about the following issue: ${subject}

${message}

Thank you for your assistance.

Sincerely,
${email}`;
    return messageBody;
};
exports.getMessageBody = getMessageBody;
