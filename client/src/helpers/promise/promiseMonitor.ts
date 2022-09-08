/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A queued promise interface.
 */
interface QueuedPromise<T = any> {
    /**
     * The internal promise to resolve.
     */
    promise: () => Promise<T>;
    /**
     * The resolve of the queued promise.
     */
    resolve: (value: T) => void;
    /**
     * The reject of the queued promise.
     */
    reject: (reason?: any) => void;
}

export enum PromiseStatus {
    WORKING = "working",
    DONE = "done"
}

/**
 * A promise-queue monitor class. Allows to enqueue promises a check if all the work is done.
 */
class PromiseMonitor {
    /**
     * Is the monitor working.
     */
    public working: boolean = false;

    /**
     * The queued promises.
     */
    private readonly queue: QueuedPromise[] = [];

    /**
     * Callback for when the promise status changes.
     */
    private readonly onStatusChangeCallback: (status: PromiseStatus) => void;

    /**
     * The constructor.
     * @param onStatusChangeCallback Callback to execute when the promise status changes.
     */
    constructor(onStatusChangeCallback: (status: PromiseStatus) => void) {
        this.onStatusChangeCallback = onStatusChangeCallback;
    }

    /**
     * Used to enqueue a promise in the PromiseMonitor.
     * @param promise The internal promise to enqueue.
     * @returns The wrapped Promise.
     */
    public async enqueue<T>(promise: () => Promise<T>): Promise<T> {
        const wp: Promise<T> = new Promise((resolve, reject) => {
            this.queue.push({
                promise,
                resolve,
                reject
            });
            this.dequeue();
        });

        return wp;
    }

    /**
     * Check on queued promises and set the working flag.
     * @returns Is the dequeuing done.
     */
    private dequeue(): boolean {
        if (this.working) {
            return false;
        }

        const item = this.queue.shift();
        if (!item) {
            this.onStatusChangeCallback(PromiseStatus.DONE);
            return false;
        }

        try {
            this.working = true;
            this.onStatusChangeCallback(PromiseStatus.WORKING);
            item.promise().then(value => {
                item.resolve(value);
            })
            .catch(err => {
                item.reject(err);
            })
            .finally(() => {
                this.working = false;
                this.dequeue();
            });
        } catch (err) {
            item.reject(err);
            this.working = false;
            this.dequeue();
        }

        return true;
    }
}

export default PromiseMonitor;

