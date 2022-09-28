/** Chronicle analytics [stardust] */

/**
 * The count stat.
 */
export interface ICountStat {
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
export type ICountAndValueStats = ICountStat & IValueStat;

/**
 * The addresses stats.
 */
export interface IAddressesStats {
    totalActiveAddresses: string;
    receivingAddresses: string;
    sendingAddresses: string;
}

/**
 * The chronicle analytics.
 */
export interface IAnalyticStats {
    nativeTokens?: ICountAndValueStats;
    nfts?: ICountAndValueStats;
    totalAddresses?: IAddressesStats;
    dailyAddresses?: IAddressesStats;
    lockedStorageDeposit?: ICountAndValueStats;
}

