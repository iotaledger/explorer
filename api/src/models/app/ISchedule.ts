import { CronJob } from "cron";

export interface ISchedule {
    /**
     * The name of the schedule.
     */
    name: string;

    /**
     * The schedule to use.
     */
    schedule: string;

    /**
     * Populated when scheduled to allow cancellation.
     */
    job?: CronJob;

    /**
     * Perform inline function.
     */
    func?(): Promise<void>;
}
