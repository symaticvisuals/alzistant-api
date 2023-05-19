import { asyncMiddleware } from "../utils/utils";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/utils";
import { handleFileUpload } from "../utils/multer";
import { createRelative } from "../functions/relative";
import { storeRelativeImage } from "./upload";
import { Relative } from "../schema/relative";
import { findPatientId } from "../functions/user";


export const create = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const { email } = req.user;
            const findPatient = await findPatientId(email);
            if (!findPatient) {
                return sendResponse(res, {
                    success: false,
                    status: 404,
                    data: null,
                    message: 'Patient not found'
                });
            }

            const { patientId } = findPatient.data;



            const { photo, name, relationship } = await handleFileUpload(req, res);
            const relative = await createRelative(name, relationship, email, patientId);
            const user = {
                id: relative._id,
                name: relative.name,
                relationship: relative.relationship,
                email: req.user.email,
                patientId: patientId
            }

            const storeImage = await storeRelativeImage(photo, JSON.stringify(user))
            console.log(storeImage)
            if (storeImage.success) {
                // update the relative with the image url
                const relativeWithImage = await Relative.findOneAndUpdate({ _id: relative._id }, { photoUrl: storeImage.data }, { new: true });

                return sendResponse(res, {
                    success: true,
                    status: 200,
                    data: relativeWithImage,
                    message: 'Relative created successfully'
                });
            } else {
                return sendResponse(res, {
                    success: false,
                    status: 400,
                    data: null,
                    message: 'Error while uploading image'
                });
            }

        } catch (error) {
            next(error);
        }
    }
);


// get all the relatives of the user
export const getAll = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const { email } = req.user;
            const { id } = req.user;
            if (req.user.role === "caretaker") {
                const relatives = await Relative.find({ email });
                return sendResponse(res, {
                    success: true,
                    status: 200,
                    data: relatives,
                    message: 'Relatives fetched successfully'
                });
            } else {
                const relatives = await Relative.find({ patientId: id });
                return sendResponse(res, {
                    success: true,
                    status: 200,
                    data: relatives,
                    message: 'Relatives fetched successfully'
                });
            }
        } catch (error) {
            next(error);
        }
    }
);







