
import mongoose, { Document, Schema, Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';


export interface UserDocument extends Document {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: "caretaker" | "user";
  mobile?: string;
  patients?: Types.ObjectId[];
}

const userSchema = new Schema<UserDocument>({
  // auto increment id for user and fill in the id field when creating a new user in the database 
  id: {
    type: String, required: true, unique: true, default: uuidv4
  },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  picture: { type: String },
  role: { type: String, enum: ["caretaker", "user"], required: true },
  mobile: { type: String },
  patients: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, {
  timestamps: true,
});

const User = mongoose.model<UserDocument>("User", userSchema);

export { User, userSchema };

