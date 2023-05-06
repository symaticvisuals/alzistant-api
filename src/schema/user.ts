import mongoose, { Document, Schema, Types } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  name: string;
  picture: string;
  role: "caretaker" | "user";
  mobile?: string;
  patients?: Types.ObjectId[];
}

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: { type: String, required: true },
  role: { type: String, enum: ["caretaker", "user"], required: true },
  mobile: { type: String },
  patients: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model<UserDocument>("User", userSchema);

export { User, userSchema };

