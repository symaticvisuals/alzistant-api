import jwt from "jsonwebtoken";
const Constants = require('./Constants')
import { Request, Response, NextFunction } from "express";


const asyncMiddleware =
    (fn: any) =>
        (req: any, res: any, next: any): Promise<any> =>
            Promise.resolve(fn(req, res, next)).catch(next);

const classResponse = (success: boolean, data: any, err: any) => {
    return {
        success,
        data,
        err,
    };
};

const generateJwtToken = (payload: any) => {
    let { name, picture, role, mobile, email } = payload;

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "30d"
    });
    return classResponse(
        true,
        {
            token: token,
            profile: {
                name, picture, role, mobile, email
            },
        },
        null
    );
};

const verifyJwtToken = async (req: any, res: any, next: any): Promise<any> => {

    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "No authorization token",
            });
        }
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        req.user = decoded;
        next();
    } catch (err) {

        return res.status(401).json({
            success: false,
            data: null,
            error: "Invalid authorization token",
        });
    }
};

const verifyCaretakerRole = async (req: any, res: any, next: any): Promise<any> => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            data: null,
            error: Constants.UNAUTHORIZED,
        });
    }
    if (req.user.role === Constants.CARETAKER) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            data: null,
            error: "Forbidden",
        });
    }
};

const verifyUserRole = async (req: any, res: any, next: any): Promise<any> => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            data: null,
            error: Constants.UNAUTHORIZED,
        });
    }
    if (req.user.role === Constants.USER) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            data: null,
            error: "Forbidden",
        });
    }
};


interface SendResponseOptions {
    status: number;
    message?: string;
    success?: boolean;
    data?: any;
    error?: any;
}

function sendResponse(
    res: Response,
    { status, message = "", success = true, data = null, error }: SendResponseOptions
) {
    const responseData = { status, success, message, data, error };

    if (responseData.error) {
        res.status(responseData.status).json({ error: responseData.error });
    } else {
        res.status(responseData.status).json(responseData);
    }
}

const errorHandler = async (err: any, req: any, res: any, next: any): Promise<any> => {
    try {
        console.log("Error in errorHandler: ", req.url, req.body, err);
        let response = {
            success: false,
            data: null,
            error: err || "Something went wrong",
        };
        res.send(response);
    } catch (err) {
        next(err);
    }
};

const getMessageBody = (message: string, email: string, subject: string): string => {
    const messageBody = `Dear support team,

I am writing to inquire about the following issue: ${subject}

${message}

Thank you for your assistance.

Sincerely,
${email}`;

    return messageBody;
};


export {
    getMessageBody,
    errorHandler,
    sendResponse,
    verifyCaretakerRole,
    verifyUserRole,
    verifyJwtToken,
    generateJwtToken,
    asyncMiddleware,
    classResponse
}