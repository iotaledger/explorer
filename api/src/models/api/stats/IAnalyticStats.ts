/** Chronicle analytics [stardust] */

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
export interface ILockedStorageDeposit {
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
export type ICountAndValue = ICountStat & IValueStat;

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
    nativeTokens?: string;
    nfts?: string;
    totalAddresses?: string;
    dailyAddresses?: string;
    lockedStorageDeposit?: string;
}

