import { PromiseStatus } from "./promiseMonitor";

export interface AsyncState {
    /**
     * Job to status map for async calls.
     */
    jobToStatus: Map<string, PromiseStatus>;
}

