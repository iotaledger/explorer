import {
    IAddressesWithBalanceDailyInflux, IAliasActivityDailyInflux, IActiveAddressesDailyInflux,
    IBlocksDailyInflux, ILedgerSizeDailyInflux, INftActivityDailyInflux, IOutputsDailyInflux,
    IStorageDepositDailyInflux, ITokensHeldPerOutputDailyInflux, ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux, ITransactionsDailyInflux, IUnclaimedGenesisOutputsDailyInflux,
    IUnclaimedTokensDailyInflux, IUnlockConditionsPerTypeDailyInflux
} from "./IInfluxTimedEntries";

/**
 * The key is a date in string format "DD-MM-YYYY"
 */
export type DayKey = string;

/**
 * The format used for moment.format(...)
 */
export const DAY_KEY_FORMAT = "DD-MM-YYYY";

/**
 * The cache for influx graphs (daily).
 */
export interface IInfluxDailyCache {
    blocksDaily: Map<DayKey, IBlocksDailyInflux>;
    transactionsDaily: Map<DayKey, ITransactionsDailyInflux>;
    outputsDaily: Map<DayKey, IOutputsDailyInflux>;
    tokensHeldDaily: Map<DayKey, ITokensHeldPerOutputDailyInflux>;
    addressesWithBalanceDaily: Map<DayKey, IAddressesWithBalanceDailyInflux>;
    activeAddressesDaily: Map<DayKey, IActiveAddressesDailyInflux>;
    tokensTransferredDaily: Map<DayKey, ITokensTransferredDailyInflux>;
    aliasActivityDaily: Map<DayKey, IAliasActivityDailyInflux>;
    unlockConditionsPerTypeDaily: Map<DayKey, IUnlockConditionsPerTypeDailyInflux>;
    nftActivityDaily: Map<DayKey, INftActivityDailyInflux>;
    tokensHeldWithUnlockConditionDaily: Map<DayKey, ITokensHeldWithUnlockConditionDailyInflux>;
    unclaimedTokensDaily: Map<DayKey, IUnclaimedTokensDailyInflux>;
    unclaimedGenesisOutputsDaily: Map<DayKey, IUnclaimedGenesisOutputsDailyInflux>;
    ledgerSizeDaily: Map<DayKey, ILedgerSizeDailyInflux>;
    storageDepositDaily: Map<DayKey, IStorageDepositDailyInflux>;
}

export interface IInfluxAnalyticsCache {
    addressesWithBalance?: string;
    nativeTokensCount?: string;
    nftsCount?: string;
    lockedStorageDeposit?: string;
    totalUnclaimedShimmer?: string;
}

/**
 * The initial empty cache object.
 */
export const CACHE_INFLUX_DAILY_INIT = {
    blocksDaily: new Map(),
    transactionsDaily: new Map(),
    outputsDaily: new Map(),
    tokensHeldDaily: new Map(),
    addressesWithBalanceDaily: new Map(),
    activeAddressesDaily: new Map(),
    tokensTransferredDaily: new Map(),
    aliasActivityDaily: new Map(),
    unlockConditionsPerTypeDaily: new Map(),
    nftActivityDaily: new Map(),
    tokensHeldWithUnlockConditionDaily: new Map(),
    unclaimedTokensDaily: new Map(),
    unclaimedGenesisOutputsDaily: new Map(),
    ledgerSizeDaily: new Map(),
    storageDepositDaily: new Map()
};

