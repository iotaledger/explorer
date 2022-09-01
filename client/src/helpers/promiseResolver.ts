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

export enum ResolverStatus {
    WORKING,
    DONE
}

/**
 * A promise queue class. Allows to enqueue promises a check if all the works is done.
 */
export class PromiseResolver {
    /**
     * Is the resolver working flag.
     */
    public working: boolean = false;

    /**
     * The queued promises.
     */
    private readonly queue: QueuedPromise[] = [];

    /**
     * Array of internal promises that can be awaited with all().
     */
    private readonly internalPromises: Promise<any>[] = [];

    /**
     * Callback for when the resolver status changes.
     */
    private readonly statusCallback: (result: ResolverStatus) => void;

    /**
     * The constructor.
     * @param statusCallback Will be called with resolver status updates.
     */
    constructor(statusCallback: (result: ResolverStatus) => void) {
        this.statusCallback = statusCallback;
    }

    /**
     * Used to enqueue a promise in the PromiseResolver.
     * @param promise The internal promise to enqueue.
     * @returns The wrapped Promise.
     */
    public async enqueue<T>(promise: () => Promise<T>): Promise<T> {
        this.statusCallback(ResolverStatus.WORKING);
        const wp: Promise<T> = new Promise((resolve, reject) => {
            this.queue.push({
                promise,
                resolve,
                reject
            });
            this.dequeue();
        });

        this.internalPromises.push(wp);

        return wp;
    }

    /**
     * Used to get a Promise.all of all QueuedPromises.
     * Should be called only after all euqueues are done.
     * @returns A promise with all.
     */
    public async all() {
        return Promise.all(this.internalPromises);
    }

    /**
     * Used recursively to check on promises and set the working flag.
     * @returns Is the dequeuing is done.
     */
    private dequeue(): boolean {
        if (this.working) {
            return false;
        }

        const item = this.queue.shift();
        if (!item) {
            this.statusCallback(ResolverStatus.DONE);
            return false;
        }

        try {
            this.working = true;
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

