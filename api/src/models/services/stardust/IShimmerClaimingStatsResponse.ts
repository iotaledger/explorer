import { IShimmerClaimStats } from "../../api/stats/IShimmerClaimStats";

export interface IShimmerClaimingStatsResponse {
    /**
     * The shimmer token claimed stats.
     */
    totalShimmerTokensClaimed?: IShimmerClaimStats;
}
