import cron from 'node-cron';
import { PillReminder } from '../schema/pillReminder';
import moment from 'moment';




const updateIsTaken = async () => {
    const now = moment();

    const reminders = await PillReminder.find({
        endDate: { $gte: now.toDate() }
    });

    reminders.forEach((reminder) => {
        reminder.timings.forEach((timing) => {
            if (timing.isTaken && reminder.toBeTakenToday) {
                timing.isTaken = false;
            }
        });
        reminder.save();
    });

};


export const cronJob = () => {
    console.log('Setting up cron job');
    cron.schedule('21 2 * * *', () => {
        console.log('Executing cron job');
        updateIsTaken().then(() => {
            console.log('Cron job completed');
        }).catch((err) => {
            console.error('Error executing cron job:', err);
        });
    });
};