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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNumberOfPatients = exports.syncUserData = exports.addpatientIdToUser = exports.createUserPatient = exports.create = void 0;
const user_1 = require("../schema/user");
const utils_1 = require("../utils/utils");
const create = (user, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, photoUrl } = user;
    const userObj = {
        name,
        email,
        picture: photoUrl,
        mobile: phoneNumber,
        role: 'caretaker',
        patients: []
    };
    const newUser = new user_1.User(userObj);
    yield newUser.validate();
    yield newUser.save();
    return (0, utils_1.classResponse)(true, newUser, null);
});
exports.create = create;
const addpatientIdToUser = (email, patientId) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = user_1.User.findOne({ email });
    if (!findUser) {
        return (0, utils_1.classResponse)(false, null, 'User not found');
    }
    const user = yield findUser.exec();
    user.patients.push(patientId);
    yield user.save();
    return (0, utils_1.classResponse)(true, user, null);
});
exports.addpatientIdToUser = addpatientIdToUser;
const createUserPatient = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(email, phoneNumber, 'email, phoneNumber');
    const userObj = {
        email,
        mobile: phoneNumber,
        role: 'user',
        patients: []
    };
    const newUser = new user_1.User(userObj);
    yield newUser.validate();
    yield newUser.save();
    let patientId = newUser._id;
    newUser.id = patientId;
    return (0, utils_1.classResponse)(true, newUser, null);
});
exports.createUserPatient = createUserPatient;
const syncUserData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, picture, email } = user;
    let findUser = user_1.User.findOne({ email });
    const syncUser = yield findUser.exec();
    syncUser.name = name;
    syncUser.picture = picture;
    yield syncUser.save();
    return (0, utils_1.classResponse)(true, syncUser, null);
});
exports.syncUserData = syncUserData;
const findNumberOfPatients = (email) => __awaiter(void 0, void 0, void 0, function* () {
    let findUser = user_1.User.findOne({ email });
    const user = yield findUser.exec();
    return (0, utils_1.classResponse)(true, user.patients.length, null);
});
exports.findNumberOfPatients = findNumberOfPatients;
