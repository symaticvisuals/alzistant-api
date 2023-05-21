"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSchema = exports.Chat = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the chat schema
const chatSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    userId: { type: String, required: true },
    caretakerId: { type: String, required: true },
}, { timestamps: true } // Automatically generates createdAt and updatedAt fields
);
exports.chatSchema = chatSchema;
// Pre-save middleware to filter out potential cyber attacks and explicit content
chatSchema.pre('save', function (next) {
    const filteredMessage = filterChatMessage(this.message);
    this.message = filteredMessage;
    next();
});
function filterChatMessage(message) {
    const filteredMessage = clean(message);
    return filteredMessage;
}
// Define the chat model
const Chat = mongoose_1.default.model('Chat', chatSchema);
exports.Chat = Chat;
