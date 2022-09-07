import { ResolverStatus } from "../../../helpers/promiseResolver";

export interface PromiseResolverState {
    /**
     * The statuses for async calls.
     */
    asyncStatuses: {
        [jobName: string]: ResolverStatus;
    };
}

