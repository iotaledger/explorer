export class Shift {
    public startTimestamp?: number;

    public shift = 0;

    public calculateShift(timestamp: number) {
        if (!this.startTimestamp) {
            console.log(timestamp);
            this.startTimestamp = timestamp;
            return 0;
        }

        const diff = timestamp - this.startTimestamp;
        return Math.floor(diff / 1000);
    }
}
