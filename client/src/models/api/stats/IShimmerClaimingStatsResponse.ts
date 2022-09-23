import { IChronicleResponse } from "../IChronicleResponse";
import { IResponse } from "../IResponse";

export interface IShimmerClaimStats {
    count: string;
}

export interface IShimmerClaimingStatsResponse extends IChronicleResponse, IResponse {
    /**
     * The shimmer token claimed stats.
     */
    totalShimmerTokensClaimed?: IShimmerClaimStats;
}
