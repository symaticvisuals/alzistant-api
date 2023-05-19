import mongoose, { Schema, Document } from 'mongoose';

interface IRelative extends Document {
    name: string;
    relationship: string;
    email: string;
    photoUrl: string;
    patientId: string;
}

const relativeSchema = new Schema<IRelative>(
    {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        email: { type: String, required: true },
        photoUrl: { type: String },
        patientId: {type:String, required:true}
    },
    { timestamps: true }
);

const Relative = mongoose.model<IRelative>('Relative', relativeSchema);

export { Relative, relativeSchema };