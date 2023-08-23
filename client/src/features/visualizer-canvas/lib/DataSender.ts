import { DATA_SENDER_TIME_INTERVAL } from "./constants";

export class DataSender {
    private lastSentTimestamp: number = 0;

    private readonly limit: number;

    constructor(limit: number = DATA_SENDER_TIME_INTERVAL) {
        this.limit = limit;
    }

    public shouldSend(timestamp: number): boolean {
        if (!this.lastSentTimestamp) {
            this.lastSentTimestamp = timestamp;
            return false;
        }

        const timeDifference = timestamp - this.lastSentTimestamp;
        if (timeDifference >= this.limit) {
            this.lastSentTimestamp = timestamp;
            return true;
        }
        return false;
    }
}
