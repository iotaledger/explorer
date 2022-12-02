import {
    IAddressesWithBalanceDailyInflux, IAliasActivityDailyInflux, IAvgAddressesPerMilestoneDailyInflux,
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
 * The influx Db cache object.
 */
export interface IInfluxDbCache {
    blocksDaily: Map<DayKey, IBlocksDailyInflux>;
    transactionsDaily: Map<DayKey, ITransactionsDailyInflux>;
    outputsDaily: Map<DayKey, IOutputsDailyInflux>;
    tokensHeldDaily: Map<DayKey, ITokensHeldPerOutputDailyInflux>;
    addressesWithBalanceDaily: Map<DayKey, IAddressesWithBalanceDailyInflux>;
    avgAddressesPerMilestoneDaily: Map<DayKey, IAvgAddressesPerMilestoneDailyInflux>;
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

/**
 * The initial empty cache object.
 */
export const CACHE_INIT = {
    blocksDaily: new Map(),
    transactionsDaily: new Map(),
    outputsDaily: new Map(),
    tokensHeldDaily: new Map(),
    addressesWithBalanceDaily: new Map(),
    avgAddressesPerMilestoneDaily: new Map(),
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

