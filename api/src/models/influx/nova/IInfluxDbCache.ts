import {
    IAccountActivityDailyInflux,
    IActiveAddressesDailyInflux,
    IAddressesWithBalanceDailyInflux,
    IAnchorActivityDailyInflux,
    IBlockIssuerDailyInflux,
    IBlocksDailyInflux,
    IDelegationActivityDailyInflux,
    IDelegationsActivityDailyInflux,
    IDelegatorsActivityDailyInflux,
    IFoundryActivityDailyInflux,
    ILedgerSizeDailyInflux,
    IManaBurnedDailyInflux,
    INftActivityDailyInflux,
    IOutputsDailyInflux,
    IStakingActivityDailyInflux,
    IStorageDepositDailyInflux,
    ITokensHeldPerOutputDailyInflux,
    ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux,
    ITransactionsDailyInflux,
    IUnlockConditionsPerTypeDailyInflux,
    IValidatorsActivityDailyInflux,
} from "./IInfluxTimedEntries";
import { DayKey, ITimedEntry } from "../types";

/**
 * The cache for influx graphs (daily).
 */
export interface IInfluxDailyCache {
    blocksDaily: Map<DayKey, IBlocksDailyInflux>;
    blockIssuersDaily: Map<DayKey, IBlockIssuerDailyInflux>;
    transactionsDaily: Map<DayKey, ITransactionsDailyInflux>;
    outputsDaily: Map<DayKey, IOutputsDailyInflux>;
    tokensHeldDaily: Map<DayKey, ITokensHeldPerOutputDailyInflux>;
    addressesWithBalanceDaily: Map<DayKey, IAddressesWithBalanceDailyInflux>;
    activeAddressesDaily: Map<DayKey, IActiveAddressesDailyInflux>;
    tokensTransferredDaily: Map<DayKey, ITokensTransferredDailyInflux>;
    anchorActivityDaily: Map<DayKey, IAnchorActivityDailyInflux>;
    nftActivityDaily: Map<DayKey, INftActivityDailyInflux>;
    accountActivityDaily: Map<DayKey, IAccountActivityDailyInflux>;
    foundryActivityDaily: Map<DayKey, IFoundryActivityDailyInflux>;
    delegationActivityDaily: Map<DayKey, IDelegationActivityDailyInflux>;
    validatorsActivityDaily: Map<DayKey, IValidatorsActivityDailyInflux>;
    delegatorsActivityDaily: Map<DayKey, IDelegatorsActivityDailyInflux>;
    delegationsActivityDaily: Map<DayKey, IDelegationsActivityDailyInflux>;
    stakingActivityDaily: Map<DayKey, IStakingActivityDailyInflux>;
    unlockConditionsPerTypeDaily: Map<DayKey, IUnlockConditionsPerTypeDailyInflux>;
    tokensHeldWithUnlockConditionDaily: Map<DayKey, ITokensHeldWithUnlockConditionDailyInflux>;
    ledgerSizeDaily: Map<DayKey, ILedgerSizeDailyInflux>;
    storageDepositDaily: Map<DayKey, IStorageDepositDailyInflux>;
    manaBurnedDaily: Map<DayKey, IManaBurnedDailyInflux>;
}

/**
 * The cache for influx analytics.
 */
export interface IInfluxAnalyticsCache {
    accountAddressesWithBalance?: string;
    nativeTokensCount?: string;
    nftsCount?: string;
    lockedStorageDeposit?: string;
    delegatorsCount?: string;
}

interface IEpochAnalyticStats {
    epochIndex: number;
    blockCount: number;
    perPayloadType: {
        transaction: number;
        taggedData: number;
        candidacy: number;
        noPayload: number;
    };
}

interface ISlotAnalyticStats {
    slotIndex: number;
    blockCount: number;
    perPayloadType: {
        transaction: number;
        taggedData: number;
        candidacy: number;
        noPayload: number;
    };
}

/**
 * The epoch stats cache. Map epoch index to stats.
 */
export type IInfluxEpochAnalyticsCache = Map<number, IEpochAnalyticStats>;

export type ManaBurnedInSlot = ITimedEntry & {
    slotIndex: number;
    manaBurned: number;
};

/**
 * The epoch stats cache. Map epoch index to stats.
 */
export type ManaBurnedInSlotCache = Map<number, ManaBurnedInSlot>;

/**
 * The slot stats cache. Map slot index to stats.
 */
export type IInfluxSlotAnalyticsCache = Map<number, ISlotAnalyticStats>;

/**
 * The helper to initialize empty maps
 * @returns The initial cache object
 */
export const initializeEmptyDailyCache = () => ({
    blocksDaily: new Map(),
    blockIssuersDaily: new Map(),
    transactionsDaily: new Map(),
    outputsDaily: new Map(),
    tokensHeldDaily: new Map(),
    addressesWithBalanceDaily: new Map(),
    activeAddressesDaily: new Map(),
    tokensTransferredDaily: new Map(),
    anchorActivityDaily: new Map(),
    nftActivityDaily: new Map(),
    accountActivityDaily: new Map(),
    foundryActivityDaily: new Map(),
    delegationActivityDaily: new Map(),
    validatorsActivityDaily: new Map(),
    delegatorsActivityDaily: new Map(),
    delegationsActivityDaily: new Map(),
    stakingActivityDaily: new Map(),
    unlockConditionsPerTypeDaily: new Map(),
    tokensHeldWithUnlockConditionDaily: new Map(),
    ledgerSizeDaily: new Map(),
    storageDepositDaily: new Map(),
    manaBurnedDaily: new Map(),
});
