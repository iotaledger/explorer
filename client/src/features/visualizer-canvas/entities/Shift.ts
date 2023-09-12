import {
    DATA_SENDER_TIME_INTERVAL,
    THRESHOLD_SHIFT_PX
} from "../lib/constants";

export class Shift {
    public startTimestamp?: number;

    public stageWidth = 0;

    public stageHeight = 0;

    public leftShiftVisible = 1;

    public rightShiftVisible = 1;

    /**
     * Calculate last shift;
     * @param timestamp
     */
    public calculateRightShift(timestamp: number) {
        if (!this.startTimestamp) {
            this.startTimestamp = timestamp;
            return 1;
        }

        const diff = timestamp - this.startTimestamp;

        // Min shift is 1
        this.rightShiftVisible =
            Math.floor(diff / DATA_SENDER_TIME_INTERVAL) + 1;

        return this.rightShiftVisible;
    }

    public getRangeShiftVisible() {
        this.calculateLeftShift();

        return this.createRange(
            this.leftShiftVisible - 16,
            this.rightShiftVisible
        );
    }

    /**
     * We need to know stage width to calculate visible shift
     * @param width
     */
    public setStageWidth(width: number) {
        this.stageWidth = width;
    }

    public setStageHeight(height: number) {
        this.stageHeight = height;
    }

    public calculateLeftShift() {
        // max number of shift visible on screen
        const max = Math.floor(this.stageWidth / THRESHOLD_SHIFT_PX) + 1;

        this.leftShiftVisible = this.rightShiftVisible - max; // technicaly feature works, but scaling is not correct
        return this.leftShiftVisible;
    }

    private createRange(start: number, end: number) {
        const range = [];
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    }
}
