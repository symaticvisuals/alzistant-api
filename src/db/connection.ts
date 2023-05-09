import mongoose, { ConnectOptions } from "mongoose";
import { userSchema, User } from "../schema/user";
import dotenv from "dotenv";
import { pillReminderSchema, PillReminder } from "../schema/pillReminder";
dotenv.config();

// Define models
const models = {
  User: mongoose.model("User", userSchema),
  PillReminder: mongoose.model("PillReminder", pillReminderSchema),
};

// Export a function that connects to the MongoDB database and returns middleware for handling database connections
export default function connectDbMiddleware(options: ConnectOptions = {}) {
  const dbUrl = process.env.MONGODB_URI;

  // Merge default options with user-specified options
  const connectOptions: ConnectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ...options,
  } as any;

  // Connect to MongoDB
  mongoose.connect(dbUrl, connectOptions);

  const db = mongoose.connection;

  // Set up event listeners for database connection events
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", async () => {
    console.log("Connected to the database.");

    // Create collections if they don't exist
    for (const [modelName, model] of Object.entries(models)) {
      const collectionName = mongoose.pluralize()(modelName);
      const collectionExists = await mongoose.connection.db
        .listCollections({ name: collectionName })
        .hasNext();

      if (!collectionExists) {
        console.log(`Creating ${collectionName} collection...`);
        await mongoose.connection.createCollection(collectionName);
        console.log(`Created ${collectionName} collection.`);
      }
    }
  });

  // Return middleware function for handling database connections
  return function connectDb(req: any, res: any, next: any) {
    if (mongoose.connection.readyState !== 1) {
      console.log("Reconnecting to the database.");
      mongoose.connect(dbUrl, connectOptions);
    }
    next();
  };
}

// Export the models
export { User, PillReminder, connectDbMiddleware };
