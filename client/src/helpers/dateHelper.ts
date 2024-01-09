import moment from "moment";

/**
 * Class to help with date formatting.
 */
export class DateHelper {
    /**
     * Format the date.
     * @param valueInMs The value to format in milliseconds.
     * @returns The formated value.
     */
    public static format(valueInMs: number): string {
        const timeMoment = moment(valueInMs);

        const postDate = valueInMs > Date.now() ? "in the future" : "ago";

        return `${timeMoment.format("LLLL")} - ${moment.duration(moment().diff(timeMoment)).humanize()} ${postDate}`;
    }

    /**
     * Format the date.
     * @param valueInMs The value to format in milliseconds.
     * @returns The formated value.
     */
    public static formatNoTime(valueInMs: number): string {
        const timeMoment = moment(valueInMs);

        const postDate = valueInMs > Date.now() ? "in the future" : "ago";

        return `${timeMoment.format("LL")} - ${moment.duration(moment().diff(timeMoment)).humanize()} ${postDate}`;
    }

    /**
     * Format the date in short format.
     * @param valueInMs The value to format in milliseconds.
     * @returns The formated value.
     */
    public static formatShort(valueInMs: number): string {
        return moment(valueInMs).format("YYYY-MM-DD HH:mm:ss");
    }

    /**
     * Check the value is in ms if not scale accordingly.
     * @param valueInMs The value to format in milliseconds.
     * @returns The updated value.
     */
    public static milliseconds(valueInMs: number): number {
        const asStringLength = valueInMs.toString().length;

        // If there are less than 13 digits this must be in seconds
        // https://stackoverflow.com/questions/23929145/how-to-test-if-a-given-time-stamp-is-in-seconds-or-milliseconds
        if (asStringLength < 13) {
            return valueInMs * 1000;
        }
        return valueInMs;
    }
}
