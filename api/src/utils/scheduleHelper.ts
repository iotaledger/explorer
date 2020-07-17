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
    public static build(schedules: ISchedule[]): void {
        for (const schedule of schedules) {
            console.log(`Created: ${schedule.name} with ${schedule.schedule}`);

            schedule.job = new CronJob(
                schedule.schedule,
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                async () => {
                    try {
                        await schedule.func();
                    } catch (err) {
                        console.error(schedule.name, err);
                    }
                },
                undefined,
                true,
                undefined,
                undefined,
                true);
        }
    }
}
