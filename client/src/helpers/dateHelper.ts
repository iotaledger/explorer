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
}
