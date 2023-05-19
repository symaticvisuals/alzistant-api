import { Relative } from "../schema/relative";


const createRelative = async (name: string, relationship: string, email: string, patientId: string) => {
    const relative = new Relative({ name, relationship, email, patientId });
    await relative.save();
    // return relative as a object instead of a document
    return relative.toObject();
}

export { createRelative };