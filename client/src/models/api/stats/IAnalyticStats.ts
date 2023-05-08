/** Chronicle analytics [stardust] */
import { IResponse } from "../IResponse";
import { IProtoStats } from "./IProtoStats";

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
    TODO: Move this somewhere else
    mana?: IProtoStats;
}

