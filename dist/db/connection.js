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
exports.connectDbMiddleware = exports.PillReminder = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../schema/user");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_1.User; } });
const dotenv_1 = __importDefault(require("dotenv"));
const pillReminder_1 = require("../schema/pillReminder");
Object.defineProperty(exports, "PillReminder", { enumerable: true, get: function () { return pillReminder_1.PillReminder; } });
dotenv_1.default.config();
// Define models
const models = {
    User: mongoose_1.default.model("User", user_1.userSchema),
    PillReminder: mongoose_1.default.model("PillReminder", pillReminder_1.pillReminderSchema),
};
// Export a function that connects to the MongoDB database and returns middleware for handling database connections
function connectDbMiddleware(options = {}) {
    const dbUrl = process.env.MONGODB_URI;
    // Merge default options with user-specified options
    const connectOptions = Object.assign({ useNewUrlParser: true, useUnifiedTopology: true }, options);
    // Connect to MongoDB
    mongoose_1.default.connect(dbUrl, connectOptions);
    const db = mongoose_1.default.connection;
    // Set up event listeners for database connection events
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => __awaiter(this, void 0, void 0, function* () {
        console.log("Connected to the database.");
        // Create collections if they don't exist
        for (const [modelName, model] of Object.entries(models)) {
            const collectionName = mongoose_1.default.pluralize()(modelName);
            const collectionExists = yield mongoose_1.default.connection.db
                .listCollections({ name: collectionName })
                .hasNext();
            if (!collectionExists) {
                yield mongoose_1.default.connection.createCollection(collectionName);
            }
        }
    }));
    // Return middleware function for handling database connections
    return function connectDb(req, res, next) {
        if (mongoose_1.default.connection.readyState !== 1) {
            console.log("Reconnecting to the database.");
            mongoose_1.default.connect(dbUrl, connectOptions);
        }
        next();
    };
}
exports.default = connectDbMiddleware;
exports.connectDbMiddleware = connectDbMiddleware;
