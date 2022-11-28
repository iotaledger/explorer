import { IResponse } from "../../IResponse";

export interface IBlocksDailyInflux {
    time: Date;
    transaction: number | null;
    milestone: number | null;
    taggedData: number | null;
    noPayload: number | null;
}

export interface ITransactionsDailyInflux {
    time: Date;
    confirmed: number | null;
    conflicting: number | null;
}

export interface IOutputsDailyInflux {
    time: Date;
    basic: number | null;
    alias: number | null;
    foundry: number | null;
    nft: number | null;
}

export interface ITokensHeldPerOutputDailyInflux {
    time: Date;
    basic: number | null;
    alias: number | null;
    foundry: number | null;
    nft: number | null;
}

export interface IAddressesWithBalanceDailyInflux {
    time: Date;
    addressesWithBalance: number | null;
}

export interface IAvgAddressesPerMilestoneDailyInflux {
    time: Date;
    addressesReceiving: number | null;
    addressesSending: number | null;
}

export interface ITokensTransferredDailyInflux {
    time: Date;
    tokens: number | null;
}

export interface IAliasActivityDailyInflux {
    time: Date;
    created: number | null;
    governorChanged: number | null;
    stateChanged: number | null;
    destroyed: number | null;
}

export interface IUnlockConditionsPerTypeDailyInflux {
    time: Date;
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
}

export interface INftActivityDailyInflux {
    time: Date;
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
}

export interface ITokensHeldWithUnlockConditionDailyInflux {
    time: Date;
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
}

export interface IUnclaimedTokensDailyInflux {
    time: Date;
    unclaimed: number | null;
}

export interface IUnclaimedGenesisOutputsDailyInflux {
    time: Date;
    unclaimed: number | null;
}

export interface ILedgerSizeDailyInflux {
    time: Date;
    keyBytes: number | null;
    dataBytes: number | null;
}

export interface IStorageDepositDailyInflux {
    time: Date;
    storageDeposit: number | null;
}

export interface IInfluxDailyResponse extends IResponse {
    blocksDaily: IBlocksDailyInflux[];
    transactionsDaily: ITransactionsDailyInflux[];
    outputsDaily?: IOutputsDailyInflux[];
    tokensHeldDaily?: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily?: IAddressesWithBalanceDailyInflux[];
    avgAddressesPerMilestoneDaily?: IAvgAddressesPerMilestoneDailyInflux[];
    tokensTransferredDaily?: ITokensTransferredDailyInflux[];
    aliasActivityDaily?: IAliasActivityDailyInflux[];
    unlockConditionsPerTypeDaily?: IUnlockConditionsPerTypeDailyInflux[];
    nftActivityDaily?: INftActivityDailyInflux[];
    tokensHeldWithUnlockConditionDaily?: ITokensHeldWithUnlockConditionDailyInflux[];
    unclaimedTokensDaily?: IUnclaimedTokensDailyInflux[];
    unclaimedGenesisOutputsDaily?: IUnclaimedGenesisOutputsDailyInflux[];
    ledgerSizeDaily?: ILedgerSizeDailyInflux[];
    storageDepositDaily?: IStorageDepositDailyInflux[];
}

