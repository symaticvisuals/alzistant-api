import mongoose, { Schema, Document } from 'mongoose';
import { filter } from 'profanity-filter';

// Define the message interface
interface IMessage extends Document {
    message: string;
    sentAt: Date;
    sender: 'caretaker' | 'user' | 'chatbot';
    userEmail: string;
}

// Define the chat schema
const chatSchema = new Schema<IMessage>(
    {
        message: { type: String, required: true },
        sentAt: { type: Date, required: true },
        sender: { type: String, enum: ['caretaker', 'user', 'chatbot'], required: true },
        userEmail: { type: String, required: true },
    },
    { timestamps: true } // Automatically generates createdAt and updatedAt fields
);

// Pre-save middleware to filter out potential cyber attacks and explicit content
chatSchema.pre<IMessage>('save', function (next) {
    const filteredMessage = filterChatMessage(this.message);
    this.message = filteredMessage;
    next();
});

// Filter function to remove explicit words using profanity-filter package
function filterChatMessage(message: string): string {
    const filteredMessage = filter.clean(message);
    return filteredMessage;
}

// Define the chat model
const Chat = mongoose.model<IMessage>('Chat', chatSchema);

export { Chat, chatSchema };
