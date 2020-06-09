import { CronJob } from "cron";
import { ISchedule } from "../models/app/ISchedule";

/**
 * Class to help with scheduling.
 */
export class ScheduleHelper {
    /**
     * Build schedules for the app.
     * @param schedules The schedules to build.
     */
    public static async build(schedules: ISchedule[]): Promise<void> {
        if (schedules) {
            for (let i = 0; i < schedules.length; i++) {
                console.log(`Created: ${schedules[i].name} with ${schedules[i].schedule}`);
                const callFunc = async () => {
                    try {
                        await schedules[i].func();
                    } catch (err) {
                        console.error(schedules[i].name, err);
                    }
                };
                schedules[i].job = new CronJob(schedules[i].schedule, callFunc);
                schedules[i].job.start();
                await callFunc();
            }
        }
    }
}
