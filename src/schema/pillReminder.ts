import moment from "moment-timezone";
moment.tz.setDefault("Asia/Kolkata");

import mongoose, { Document, Schema } from "mongoose";

interface IPillReminder extends Document {
  user: string;
  caretakerId?: string;
  timings: {
    time: string;
    isTaken: boolean;
    momentTime?: moment.Moment;
  }[];
  medicineName: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
  frequency: "daily" | "one-day" | "alternate";
  duration: number;
  category: string;
  toBeTakenToday: boolean;
  toBeTakenTomorrow: boolean;
  lateTime: string[];
}



const pillReminderSchema = new Schema<IPillReminder>({
  user: { type: String, ref: "User", required: true, index: true },
  caretakerId: { type: String, ref: "User", index: true },
  timings: [{
    time: { type: String, required: true },
    isTaken: { type: Boolean, default: false },
    momentTime: { type: Schema.Types.Mixed }
  }],
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true, index: true },
  frequency: {
    type: String,
    enum: ["daily", "one-day", "alternate"],
    required: true,
  },
  category: { type: String, index: true },
}, { timestamps: true });

pillReminderSchema.pre('save', function (next) {
  const pillReminder = this as IPillReminder;

  pillReminder.timings.forEach((timing) => {
    const momentTime = moment.tz(`${pillReminder.startDate.toISOString().substring(0, 10)}T${timing.time}:00.000Z`, 'Asia/Kolkata');
    timing.momentTime = momentTime;
  });

  next();
});


pillReminderSchema.virtual("duration").get(function (this: IPillReminder) {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const durationInDays = Math.round(
    Math.abs((this.endDate.getTime() - this.startDate.getTime()) / oneDay)
  );
  if (this.frequency === "daily") {
    return durationInDays;
  } else if (this.frequency === "one-day") {
    return 1;
  } else {
    // If the frequency is alternate, we need to add one extra day to the duration if the
    // duration is an odd number, to account for the extra day in the alternating schedule.
    const duration = Math.ceil(durationInDays / 2);
    return duration % 2 === 0 ? duration : duration + 1;
  }
});



pillReminderSchema.virtual('toBeTakenToday').get(function (this: IPillReminder) {
  const now = moment();
  const isDaily = this.frequency === 'daily';
  const isBeforeEndDate = now.isSameOrBefore(moment(this.endDate));
  const isAfterStartDate = now.isSameOrAfter(moment(this.startDate));
  if (isDaily && isBeforeEndDate && isAfterStartDate) {
    return true;
  } else if (this.frequency === 'one-day' && now.isSame(moment(this.startDate), 'day')) {
    return true;
  } else if (this.frequency === 'alternate') {
    const diffDays = now.diff(moment(this.startDate), 'days');
    return diffDays % 2 === 0;
  } else {
    return false;
  }
});

pillReminderSchema.virtual('toBeTakenTomorrow').get(function (this: IPillReminder) {
  const now = moment();
  const tomorrow = moment().add(1, 'day');
  const isDaily = this.frequency === 'daily';
  const isBeforeEndDate = tomorrow.isSameOrBefore(moment(this.endDate));
  if (isDaily && isBeforeEndDate) {
    const tomorrowString = tomorrow.format('YYYY-MM-DD');
    return this.timings.some(timing => {
      const reminderTimeString = `${tomorrowString} ${timing.time}`;
      const reminderTime = moment.tz(reminderTimeString, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
      return reminderTime.isAfter(now);
    });
  } else if (this.frequency === 'one-day' && tomorrow.isSame(moment(this.startDate), 'day')) {
    return true;
  } else if (this.frequency === 'alternate') {
    const diffDays = tomorrow.diff(moment(this.startDate), 'days');
    return diffDays % 2 === 0;
  } else {
    return false;
  }
});

pillReminderSchema.virtual('lateTime').get(function () {
  const now = moment.tz('Asia/Kolkata');
  const isLate = [];

  this.timings = this.timings.filter((timing) => {
    const timingMoment = moment.tz(timing.time, 'HH:mm', 'Asia/Kolkata');

    if (!timing.isTaken && moment.duration(now.diff(timingMoment)).asMinutes() >= 10) {
      // also add the date on which the timing is late
      isLate.push(timing);
      return false; // Remove the late timing from the timings array
    }

    return true; // Keep the timing in the timings array
  });

  return isLate;
});



const PillReminder = mongoose.model<IPillReminder>(
  "PillReminder",
  pillReminderSchema,
);

export { PillReminder, pillReminderSchema, IPillReminder };
