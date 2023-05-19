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
exports.getAll = exports.create = void 0;
const utils_1 = require("../utils/utils");
const utils_2 = require("../utils/utils");
const multer_1 = require("../utils/multer");
const relative_1 = require("../functions/relative");
const upload_1 = require("./upload");
const relative_2 = require("../schema/relative");
const user_1 = require("../functions/user");
exports.create = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.user;
        const findPatient = yield (0, user_1.findPatientId)(email);
        if (!findPatient) {
            return (0, utils_2.sendResponse)(res, {
                success: false,
                status: 404,
                data: null,
                message: 'Patient not found'
            });
        }
        const { patientId } = findPatient.data;
        const { photo, name, relationship } = yield (0, multer_1.handleFileUpload)(req, res);
        const relative = yield (0, relative_1.createRelative)(name, relationship, email, patientId);
        const user = {
            id: relative._id,
            name: relative.name,
            relationship: relative.relationship,
            email: req.user.email,
            patientId: patientId
        };
        const storeImage = yield (0, upload_1.storeRelativeImage)(photo, JSON.stringify(user));
        console.log(storeImage);
        if (storeImage.success) {
            // update the relative with the image url
            const relativeWithImage = yield relative_2.Relative.findOneAndUpdate({ _id: relative._id }, { photoUrl: storeImage.data }, { new: true });
            return (0, utils_2.sendResponse)(res, {
                success: true,
                status: 200,
                data: relativeWithImage,
                message: 'Relative created successfully'
            });
        }
        else {
            return (0, utils_2.sendResponse)(res, {
                success: false,
                status: 400,
                data: null,
                message: 'Error while uploading image'
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
// get all the relatives of the user
exports.getAll = (0, utils_1.asyncMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.user;
        const { id } = req.user;
        if (req.user.role === "caretaker") {
            const relatives = yield relative_2.Relative.find({ email });
            return (0, utils_2.sendResponse)(res, {
                success: true,
                status: 200,
                data: relatives,
                message: 'Relatives fetched successfully'
            });
        }
        else {
            const relatives = yield relative_2.Relative.find({ patientId: id });
            return (0, utils_2.sendResponse)(res, {
                success: true,
                status: 200,
                data: relatives,
                message: 'Relatives fetched successfully'
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
