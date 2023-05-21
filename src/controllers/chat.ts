import { sendResponse } from "../utils/utils";
import { Request, Response, NextFunction } from "express";
import { asyncMiddleware } from "../utils/utils";

import { createAPIChat, createChat, getAllChats } from "../functions/chat";

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

            const careTakerChatMessage = await createChat(message, 'caretaker', req.user.email);

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
