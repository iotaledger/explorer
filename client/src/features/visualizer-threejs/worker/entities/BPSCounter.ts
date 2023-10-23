import { SECOND } from "../../constants";

const BPS_SPLIT_TO = 4;

export class BPSCounter {
    private currentBlockCount: number = 0;

    private readonly blockTimes: number[] = [];

    private timer: NodeJS.Timeout | null = null;

    private readonly callback: ((bps: number) => void) | null = null;

    constructor(callback: (bps: number) => void) {
        this.callback = callback;
    }

    public start() {
        if (!this.timer) {
            this.timer = setInterval(() => {
                // Push the currentBlockCount to blockTimes and reset it
                this.blockTimes.push(this.currentBlockCount);
                this.currentBlockCount = 0;

                // Ensure we only keep the latest 4 counts
                if (this.blockTimes.length > BPS_SPLIT_TO) {
                    this.blockTimes.shift();
                }

                const bps = this.getBPS();

                if (this.callback) {
                    this.callback(bps);
                }
            }, SECOND / BPS_SPLIT_TO); // 250ms interval
        }
    }

    public stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    public addBlock() {
        this.currentBlockCount++;
    }

    public getBPS(): number {
        const sum = this.blockTimes.reduce((acc, count) => acc + count, 0);

        if (!sum) {
            return 0;
        }

        return sum / this.blockTimes.length * BPS_SPLIT_TO;
    }
}
