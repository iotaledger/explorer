import schedule from "node-schedule";
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
                schedules[i].cancelId = schedule.scheduleJob(schedules[i].schedule, callFunc);
                await callFunc();
            }
        }
    }
}
