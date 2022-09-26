/** Chronicle analytics [stardust] */

import { IResponse } from "../IResponse";
import { IShimmerClaimed } from "./IShimmerClaimed";

/**
 * The count stat.
 */
interface ICountStat {
    count: number;
}

/**
 * The value stat.
 */
interface IValueStat {
    totalValue: number;
}

/**
 * Count and value analytic stats used for native tokens & nfts.
 */
type ICountAndValueStats = ICountStat & IValueStat;

/**
 * The addresses stats.
 */
interface IAddressesStats {
    totalActiveAddresses: string;
    receivingAddresses: string;
    sendingAddresses: string;
}

/**
 * The chronicle analytics.
 */
export interface IAnalyticStats extends IResponse {
    nativeTokens?: ICountAndValueStats;
    nfts?: ICountAndValueStats;
    totalAddresses?: IAddressesStats;
    dailyAddresses?: IAddressesStats;
    lockedStorageDeposit?: ICountAndValueStats;
    shimmerClaimed?: IShimmerClaimed;
}

