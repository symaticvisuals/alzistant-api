import { sendResponse } from '../utils/utils';
import { Request, Response, NextFunction } from 'express';
import { asyncMiddleware } from '../utils/utils';
import { addpatientIdToUser, createUserPatient, findCaretaker, findNumberOfPatients } from '../functions/user';


export const createPatient = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {

        const { email, phone } = req.body;
        try {
            const response = await createUserPatient(email, phone);
            if (!response.success) {
                return sendResponse(res, {
                    success: false,
                    status: 400,
                    data: null,
                    message: 'User Already Exists'
                });
            }
            console.log("REQUEST.USER>>>>", req.user.email);
            const addtoUser = await addpatientIdToUser(req.user.email, response.data._id);

            if (!addtoUser.success) {
                return sendResponse(res, {
                    success: false,
                    status: 400,
                    data: null,
                    message: 'User Already Exists'
                });
            }
            return sendResponse(res, {
                success: true,
                status: 200,
                data: response.data,
                message: 'User Created Successfully'
            });

        }
        catch (err) {
            next(err);
        }
    }
)

export const findPatientsCount = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {
        let { email } = req.user;
        try {
            let findNumer = await findNumberOfPatients(email);
            if (!findNumer.data) {
                return sendResponse(res, {
                    success: false,
                    status: 200,
                    data: null,
                    message: 'No Patients Found'
                });
            }
            return sendResponse(res, {
                success: true,
                status: 200,
                data: findNumer.data,
                message: 'Patients Found'
            });


        }
        catch (err) {
            next(err);
        }
    }
)


export const findCaretakerByPatientEmail = asyncMiddleware(
    async (req: any, res: Response, next: NextFunction) => {
        let { email } = req.user;
        try {
            let findCareTaker = await findCaretaker(email);
            if (!findCareTaker.data) {
                return sendResponse(res, {
                    success: false,
                    status: 200,
                    data: null,
                    message: 'No Caretaker Found'
                });
            }
            return sendResponse(res, {
                success: true,
                status: 200,
                data: findCareTaker.data,
                message: 'Caretaker Found'
            });

        } catch (err) {
            next(err);
        }
    }
)
