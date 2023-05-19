import { Chat } from '../schema/chat';
import axios from 'axios';
import moment from 'moment-timezone';

export const createChat = async (message: string, sender: 'user' | 'caretaker' | 'chatbot', userEmail: string): Promise<any> => {
    const chatMessage = new Chat({
        message,
        sentAt: moment().tz('Asia/Kolkata').toDate(),
        sender,
        userEmail,
    });
    await chatMessage.save();
    return chatMessage;
};

export const createAPIChat = async (message: string): Promise<any> => {
    const response = await axios.post('API_URL', { message }); // Replace 'API_URL' with the actual API endpoint

    const chatMessage = new Chat({
        message: response.data.message,
        sentAt: moment().tz('Asia/Kolkata').toDate(),
        sender: 'chatbot',
        userEmail: '', // Set the user email as needed
    });
    await chatMessage.save();
    return chatMessage;
};


export const getAllChats = async (email: string): Promise<any[]> => {
    try {
        const chats = await Chat.find({ userEmail: email }).sort({ sentAt: -1 }).lean();
        return chats;
    } catch (error) {
        throw error;
    }
};
