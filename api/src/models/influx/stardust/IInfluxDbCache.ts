import {
    IAddressesWithBalanceDailyInflux,
    IAliasActivityDailyInflux,
    IActiveAddressesDailyInflux,
    IBlocksDailyInflux,
    ILedgerSizeDailyInflux,
    INftActivityDailyInflux,
    IOutputsDailyInflux,
    IStorageDepositDailyInflux,
    ITokensHeldPerOutputDailyInflux,
    ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux,
    ITransactionsDailyInflux,
    IUnclaimedGenesisOutputsDailyInflux,
    IUnclaimedTokensDailyInflux,
    IUnlockConditionsPerTypeDailyInflux,
} from "./IInfluxTimedEntries";
import { DayKey } from "../types";

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

/**
 * The cache for influx analytics.
 */
export interface IInfluxAnalyticsCache {
    addressesWithBalance?: string;
    nativeTokensCount?: string;
    nftsCount?: string;
    lockedStorageDeposit?: string;
    totalUnclaimedShimmer?: string;
}

/**
 * An entry influx milestone stats cache.
 */
interface IMilestoneAnalyticStats {
    milestoneIndex: number;
    blockCount: number;
    perPayloadType: {
        transaction: number;
        milestone: number;
        taggedData: number;
        treasuryTransaction: number;
        noPayload: number;
    };
}

/**
 * The milestone stats cache. Map milestone index to stats.
 */
export type IInfluxMilestoneAnalyticsCache = Map<number, IMilestoneAnalyticStats>;

/**
 * The helper to initialize empty maps
 * @returns The initial cache object
 */
export const initializeEmptyDailyCache = () => ({
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
    storageDepositDaily: new Map(),
});
