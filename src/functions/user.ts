import { User } from "../schema/user";
import { classResponse } from "../utils/utils";

interface User {
    name: string;
    email: string;
    photoUrl: string;
}

const create = async (user: User, phoneNumber: string) => {
    const { name, email, photoUrl } = user;
    const userObj = {
        name,
        email,
        picture: photoUrl,
        mobile: phoneNumber,
        role: 'caretaker',
        patients: []
    }

    const newUser = new User(userObj);
    await newUser.validate();
    await newUser.save();

    return classResponse(true, newUser, null);
}

const addpatientIdToUser = async (email: string, patientId: any) => {
    const findUser = User.findOne({ email });
    if (!findUser) {
        return classResponse(false, null, 'User not found');
    }
    const user = await findUser.exec();
    user.patients.push(patientId);
    await user.save();
    return classResponse(true, user, null);


}

const createUserPatient = async (email: string, phoneNumber: string) => {
    console.log(email, phoneNumber, 'email, phoneNumber');
    const userObj = {
        email,
        mobile: phoneNumber,
        role: 'user',
        patients: []
    }

    const newUser = new User(userObj);
    await newUser.validate();
    await newUser.save();
    let patientId = newUser._id;
    newUser.id = patientId;
    return classResponse(true, newUser, null);
}

const syncUserData = async (user: any) => {
    const { name, picture, email } = user;
    let findUser = User.findOne({ email });
    const syncUser = await findUser.exec();
    syncUser.name = name;
    syncUser.picture = picture;
    await syncUser.save();
    return classResponse(true, syncUser, null);
}


const findNumberOfPatients = async (email: string) => {
    let findUser = User.findOne({ email });
    const user = await findUser.exec();
    return classResponse(true, user.patients.length, null);
}

const findPatientId = async (email: string) => {
    let findUser = await User.findOne({ email }).populate('patients').exec();


    return classResponse(true, {
        patientId: findUser.patients[0].id,
        caretakerId: findUser.id
    }, null);
}




export { create, createUserPatient, addpatientIdToUser, syncUserData, findNumberOfPatients, findPatientId };
