import {
    IAccountActivityDailyInflux,
    IActiveAddressesDailyInflux,
    IAddressesWithBalanceDailyInflux,
    IAnchorActivityDailyInflux,
    IBlocksDailyInflux,
    IDelegationActivityDailyInflux,
    IDelegationsActivityDailyInflux,
    IDelegatorsActivityDailyInflux,
    IFoundryActivityDailyInflux,
    INftActivityDailyInflux,
    IOutputsDailyInflux,
    IStakingActivityDailyInflux,
    ITokensHeldPerOutputDailyInflux,
    ITokensTransferredDailyInflux,
    ITransactionsDailyInflux,
    IValidatorsActivityDailyInflux,
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
    anchorActivityDaily: Map<DayKey, IAnchorActivityDailyInflux>;
    nftActivityDaily: Map<DayKey, INftActivityDailyInflux>;
    accountActivityDaily: Map<DayKey, IAccountActivityDailyInflux>;
    foundryActivityDaily: Map<DayKey, IFoundryActivityDailyInflux>;
    delegationActivityDaily: Map<DayKey, IDelegationActivityDailyInflux>;
    validatorsActivityDaily: Map<DayKey, IValidatorsActivityDailyInflux>;
    delegatorsActivityDaily: Map<DayKey, IDelegatorsActivityDailyInflux>;
    delegationsActivityDaily: Map<DayKey, IDelegationsActivityDailyInflux>;
    stakingActivityDaily: Map<DayKey, IStakingActivityDailyInflux>;
}

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
    anchorActivityDaily: new Map(),
    nftActivityDaily: new Map(),
    accountActivityDaily: new Map(),
    foundryActivityDaily: new Map(),
    delegationActivityDaily: new Map(),
    validatorsActivityDaily: new Map(),
    delegatorsActivityDaily: new Map(),
    delegationsActivityDaily: new Map(),
    stakingActivityDaily: new Map(),
});
