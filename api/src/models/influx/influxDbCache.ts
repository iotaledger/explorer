import {
    IAddressesWithBalanceDailyInflux, IAliasActivityDailyInflux, IAvgAddressesPerMilestoneDailyInflux,
    IBlocksDailyInflux, ILedgerSizeDailyInflux, INftActivityDailyInflux, IOutputsDailyInflux,
    IStorageDepositDailyInflux, ITokensHeldPerOutputDailyInflux, ITokensHeldWithUnlockConditionDailyInflux,
    ITokensTransferredDailyInflux, ITransactionsDailyInflux, IUnclaimedGenesisOutputsDailyInflux,
    IUnclaimedTokensDailyInflux, IUnlockConditionsPerTypeDailyInflux
} from "./influxData";

/**
 * The influx Db cache object.
 */
export interface InfluxDbClientCache {
    blocksDaily: IBlocksDailyInflux[];
    transactionsDaily: ITransactionsDailyInflux[];
    outputsDaily: IOutputsDailyInflux[];
    tokensHeldDaily: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily: IAddressesWithBalanceDailyInflux[];
    avgAddressesPerMilestoneDaily: IAvgAddressesPerMilestoneDailyInflux[];
    tokensTransferredDaily: ITokensTransferredDailyInflux[];
    aliasActivityDaily: IAliasActivityDailyInflux[];
    unlockConditionsPerTypeDaily: IUnlockConditionsPerTypeDailyInflux[];
    nftActivityDaily: INftActivityDailyInflux[];
    tokensHeldWithUnlockConditionDaily: ITokensHeldWithUnlockConditionDailyInflux[];
    unclaimedTokensDaily: IUnclaimedTokensDailyInflux[];
    unclaimedGenesisOutputsDaily: IUnclaimedGenesisOutputsDailyInflux[];
    ledgerSizeDaily: ILedgerSizeDailyInflux[];
    storageDepositDaily: IStorageDepositDailyInflux[];
}

/**
 * The initial empty cache object.
 */
export const CACHE_INIT = {
    blocksDaily: [],
    transactionsDaily: [],
    outputsDaily: [],
    tokensHeldDaily: [],
    addressesWithBalanceDaily: [],
    avgAddressesPerMilestoneDaily: [],
    tokensTransferredDaily: [],
    aliasActivityDaily: [],
    unlockConditionsPerTypeDaily: [],
    nftActivityDaily: [],
    tokensHeldWithUnlockConditionDaily: [],
    unclaimedTokensDaily: [],
    unclaimedGenesisOutputsDaily: [],
    ledgerSizeDaily: [],
    storageDepositDaily: []
};
