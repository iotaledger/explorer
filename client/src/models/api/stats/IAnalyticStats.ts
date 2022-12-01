/** Chronicle analytics [stardust] */
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
 * The storage deposit stat.
 */
interface ILockedStorageDeposit {
    outputCount: string;
    storageDepositReturnCount: string;
    storageDepositReturnTotalValue: string;
    totalKeyBytes: string;
    totalDataBytes: string;
    totalByteCost: string;
    ledgerIndex: number;
    rentStructure: {
        vByteCost: number;
        vByteFactorKey: number;
        vByteFactorData: number;
    };
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
    lockedStorageDeposit?: ILockedStorageDeposit;
    shimmerClaimed?: IShimmerClaimed;
}

