import { sendResponse } from "../utils/utils";
import { Request, Response, NextFunction } from "express";
import { asyncMiddleware } from "../utils/utils";

import { createAPIChat, createChat, getAllChats, getPatientChatsByCareTaker } from "../functions/chat";
import { fetchPatientDetailsByUserEmail } from "../functions/user";

export const createUserChat = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const { message } = req.body;
            // Store the user chat
            const userChatMessage = await createChat(message, 'user', req.user.email);

            // Call the API and store the API chat
            const apiChatMessage = await createAPIChat(message, req.user.email);

            return sendResponse(res, {
                success: true,
                status: 200,
                data: { userChat: userChatMessage, apiChat: apiChatMessage },
                message: 'Chat message created successfully'
            });

        } catch (error) {
            next(error);
        }
    }
);


export const createCareTakerChat = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const { message } = req.body;
            const { email } = req.user;
            // find the patient email from the careTaker email 
            const findPatientDetails = await fetchPatientDetailsByUserEmail(email);
            const patientEmail = findPatientDetails.data.patients[0].email;
            const careTakerChatMessage = await createChat(message, 'caretaker', patientEmail);

            return sendResponse(res, {
                success: true,
                status: 200,
                data: careTakerChatMessage,
                message: 'Chat message created successfully'
            });

        } catch (error) {
            next(error);

        }
    }
);


export const getUserChats = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const { email } = req.user;
            const userChats = await getAllChats(email);
            return sendResponse(res, {
                success: true,
                status: 200,
                data: userChats,
                message: 'User chats fetched successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

export const getCareTakerChats = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const { email } = req.user;
            console.log(email, 'email');
            const patientChats = await getPatientChatsByCareTaker(email);
            return sendResponse(res, {
                success: true,
                status: 200,
                data: patientChats.data,
                message: 'CareTaker chats fetched successfully'
            });
        } catch (error) {
            next(error);

        }
    }
);

