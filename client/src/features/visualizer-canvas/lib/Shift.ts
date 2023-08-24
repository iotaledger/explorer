import { DATA_SENDER_TIME_INTERVAL } from "./constants";

export class Shift {
    public startTimestamp?: number;

    public shift = 0;

    public lastShift = 0;

    public calculateShift(timestamp: number) {
        if (!this.startTimestamp) {
            this.startTimestamp = timestamp;
            return 0;
        }

        const diff = timestamp - this.startTimestamp;

        return Math.floor(diff / DATA_SENDER_TIME_INTERVAL);
    }
}
