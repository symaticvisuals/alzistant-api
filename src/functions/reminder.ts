import { IPillReminder, PillReminder } from "../schema/pillReminder";
import { classResponse } from "../utils/utils";
import { findPatientId } from "./user";
import moment from 'moment';

const createReminder = async (caretakerId: string, patientId: string, reminder: IPillReminder) => {
    const { timings } = reminder;

    // Convert timings from string to Moment object
    const timingsMoment = timings.map(({ time }) => moment(time, 'HH:mm'));

    // Create reminder object
    const reminderObj = {
        ...reminder,
        caretakerId,
        user: patientId,
        timingsMoment,
    };

    const reminderData = new PillReminder(reminderObj);

    await reminderData.validate();
    await reminderData.save();

    const response = {
        ...reminderData.toObject(),
        toBeTakenToday: reminderData.toBeTakenToday,
        toBeTakenTomorrow: reminderData.toBeTakenTomorrow,
        duration: reminderData.duration,
    };

    return classResponse(true, response, null);
};


const findRemidners = async (email: string) => {
    const user = await findPatientId(email);
    const now = moment();
    const findRemidners = PillReminder.find({
        user: user.data.patientId,
        endDate: { $gte: now.toDate() }
    });

    const reminders = await findRemidners.exec(); // Await the query execution

    if (reminders.length === 0) {
        return classResponse(false, null, 'No reminders found');
    }

    // Loop through the reminders and update the fields
    let response = [];

    response = reminders.map((reminder: any) => {
        return {
            ...reminder.toObject(),
            isCompletedToday: reminder.isCompletedToday,
            duration: reminder.duration,
            toBeTakenToday: reminder.toBeTakenToday,
            toBeTakenTomorrow: reminder.toBeTakenTomorrow
        }
    })


    return classResponse(true, response, null);
};



const getRemindersToTake = async (email: string) => {

    const user = await findPatientId(email);
    const now = moment();
    const findRemidners = PillReminder.find({
        user: user.data.patientId,
        endDate: { $gte: now.toDate() }
    });

    const reminders = await findRemidners.exec(); // Await the query execution
    if (reminders.length === 0) {
        return classResponse(false, null, 'No reminders found');
    }

    let tomorrowReminders = reminders.filter((reminder: any) => {
        return reminder.toBeTakenTomorrow;
    }).map((reminder: any) => {
        const reminderData = {
            _id: reminder._id,
            medicineName: reminder.medicineName,
            timings: reminder.timings.map((timing: any) => {
                return { time: timing.time, isTaken: timing.isTaken, _id: timing._id };
            }),

            quantity: reminder.quantity
        };

        return reminderData;
    });


    // Loop through the reminders and update the fields
    let response = reminders.map((reminder: any) => {
        return {
            ...reminder.toObject(),
            isCompletedToday: reminder.isCompletedToday,
            duration: reminder.duration,
            toBeTakenToday: reminder.toBeTakenToday,
            toBeTakenTomorrow: reminder.toBeTakenTomorrow,
            lateTime: reminder.lateTime,
            timings: reminder.timings.filter((timing: any) => {
                return !reminder.lateTime?.includes(timing);
            })
        }
    })

    // late reminders are those which have late time array length > 0
    let lateReminders = response.filter((reminder: any) => {
        return reminder.lateTime?.length > 0 && reminder.toBeTakenToday;
    }).map((reminder: any) => {
        const reminderData = {
            medicineName: reminder.medicineName,
            lateTime: reminder.lateTime?.map((timing: any) => {
                return { time: timing.time, isTaken: timing.isTaken, _id: timing._id, momentTime: timing.momentTime };
            }),
            quantity: reminder.quantity
        };
        return reminderData;
    });



    let todayReminders = response.filter((reminder: any) => {
        return reminder.toBeTakenToday && reminder.timings.length > 0;
    }).map((reminder: any) => {
        const reminderData = {
            medicineName: reminder.medicineName,
            timings: reminder.timings.map((timing: any) => {
                return { time: timing.time, isTaken: timing.isTaken, _id: timing._id };
            }),
            quantity: reminder.quantity
        };
        return reminderData;
    });

    let nowReminders = [];

    // Check if reminder is within 45 minutes from now or is less than 10 minutes after the reminder time
    response.forEach((reminder: any) => {
        reminder.timings.forEach((timing: any) => {
            const time = moment(timing, 'HH:mm');
            const diff = time.diff(now, 'minutes');
            if (diff <= 45 && diff >= -10 && !timing.isTaken) {

                nowReminders.push({
                    _id: reminder._id,
                    medicineName: reminder.medicineName,
                    time: timing,
                    quantity: reminder.quantity
                });
            }
        })
    });




    return classResponse(true, { lateReminders, todayReminders, nowReminders, tomorrowReminders }, null);
};






export { createReminder, findRemidners, getRemindersToTake }