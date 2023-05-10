import moment from "moment-timezone";

import { createReminder, findRemidners, getRemindersToTake } from "../functions/reminder";
import { findPatientId } from "../functions/user";
import { asyncMiddleware, sendResponse } from "../utils/utils";
import { Response, NextFunction } from "express";
import { IPillReminder, PillReminder } from "../schema/pillReminder";

export const create = asyncMiddleware(async (req: any, res: Response, next: NextFunction) => {
    let user = req.user;
    let { endDate } = req.body;

    let formattedEndDate = moment(endDate).add(1, 'day').toISOString();
    req.body.endDate = formattedEndDate;


    try {
        let findUser = await findPatientId(user.email);
        const { patientId, caretakerId } = findUser.data;
        const create = await createReminder(caretakerId, patientId, req.body);
        return sendResponse(res, {
            status: 200,
            success: create.success,
            data: create.data,
            error: create.err
        })
    } catch (error) {
        next(error);
    }
})

export const getByUserId = asyncMiddleware(async (req: any, res: Response, next: NextFunction) => {
    const user = req.user;
    try {

        const categorize = await getRemindersToTake(user.email);

        return sendResponse(res, {
            status: 200,
            success: categorize.success,
            data: categorize.data,
            error: categorize.err
        })

    } catch (error) {
        next(error);
    }
})

export const updateIsTaken = asyncMiddleware(async (req: any, res: Response, next: NextFunction) => {
    const { reminderId, timingId } = req.body;
    try {
        const update = await PillReminder.findOneAndUpdate({
            _id: reminderId,
            "timings._id": timingId
        }, {
            $set: {
                "timings.$.isTaken": true
            }
        }, {
            new: true
        });

        return sendResponse(res, {
            status: 200,
            success: true,
            data: update,
            error: null
        })

    } catch (error) {
        next(error);
    }
})