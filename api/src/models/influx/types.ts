import { INanoDate } from "influx";

export interface ITimedEntry {
    time: INanoDate;
}

/**
 * The key is a date in string format "DD-MM-YYYY"
 */
export type DayKey = string;

/**
 * The format used for moment.format(...)
 */
export const DAY_KEY_FORMAT = "DD-MM-YYYY";
