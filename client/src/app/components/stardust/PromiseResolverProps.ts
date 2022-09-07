import { ResolverStatus } from "../../../helpers/promiseResolver";

export interface PromiseResolverProps {
    onAsyncStatus: (status: ResolverStatus) => void;
}

