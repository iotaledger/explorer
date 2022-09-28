import { IChronicleResponse } from "../IChronicleResponse";
import { IResponse } from "../IResponse";

/**
 * Compiled statistics about claimed tokens.
 */
export interface IShimmerClaimed {
    /**
     * The total number of claimed tokens.
     */
    count: string;
}

export interface IShimmerClaimedResponse extends IChronicleResponse, IResponse {
    /**
     * The shimmer token claimed stats.
     */
    shimmerClaimed?: IShimmerClaimed;
}
