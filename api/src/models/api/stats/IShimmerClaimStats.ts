import { IResponse } from "../IResponse";

/**
 * Compiled statistics about claimed tokens.
 */
export interface IShimmerClaimStats extends IResponse {
    /**
     * The total number of claimed tokens.
     */
    count: string;
}

