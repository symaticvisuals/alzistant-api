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

export const createAPIChat = async (message: string, email: string): Promise<any> => {
    const response = await axios.post("https://alzistant.pagekite.me/webhooks/rest/webhook", { sender: email, message }); // Replace 'API_URL' with the actual API endpoint
    // add a 2 second delay to simulate API response time
    console.log(response.data);
    let data = null;
    if (response.data.length > 1) {
        data = response.data[1].text;
    } else {
        data = response.data[0].text;
    }
    const chatMessage = new Chat({
        message: data,
        sentAt: moment().tz('Asia/Kolkata').toDate(),
        sender: 'chatbot',
        userEmail: email, // Set the user email as needed
    });
    await chatMessage.save();
    return chatMessage;
};



export const getAllChats = async (email: string): Promise<any[]> => {
    try {
        const chats = await Chat.find({ userEmail: email }).sort({ sentAt: 1 }).lean();
        return chats;
    } catch (error) {
        throw error;
    }
};
