import mongoose, { Document, Schema, Types } from "mongoose";

export interface PillReminderDocument extends Document {
  user: Types.ObjectId;
  caretakerId?: Types.ObjectId;
  timings: string[];
  medicineName: string;
  quantity: number;
  dateToTake: Date;
  frequency: "daily" | "alternate" | "one-day";
}

const pillReminderSchema = new Schema<PillReminderDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  caretakerId: { type: Schema.Types.ObjectId, ref: "User" },
  timings: { type: [String], required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  dateToTake: { type: Date, required: true },
  frequency: {
    type: String,
    enum: ["daily", "alternate", "one-day"],
    required: true,
  },
});

const PillReminder = mongoose.model<PillReminderDocument>(
  "PillReminder",
  pillReminderSchema
);

export { PillReminder, pillReminderSchema };
