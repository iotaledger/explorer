import { PromiseStatus } from "./promiseMonitor";

export interface AsyncProps {
    /**
     * Callback for promise status change.
     */
    onAsyncStatusChange: (status: PromiseStatus) => void;
}

