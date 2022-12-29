/** Chronicle analytics [stardust] */
import { IResponse } from "../IResponse";

/**
 * The chronicle analytics.
 */
export interface IAnalyticStats extends IResponse {
    nativeTokens?: string;
    nfts?: string;
    totalAddresses?: string;
    dailyAddresses?: string;
    lockedStorageDeposit?: string;
    unclaimedShimmer?: string;
}

