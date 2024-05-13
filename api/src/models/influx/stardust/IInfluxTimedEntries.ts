import { ITimedEntry } from "../types";

export type IBlocksDailyInflux = ITimedEntry & {
    transaction: number | null;
    milestone: number | null;
    taggedData: number | null;
    noPayload: number | null;
};

export type ITransactionsDailyInflux = ITimedEntry & {
    confirmed: number | null;
    conflicting: number | null;
};

export type IOutputsDailyInflux = ITimedEntry & {
    basic: number | null;
    alias: number | null;
    foundry: number | null;
    nft: number | null;
};

export type ITokensHeldPerOutputDailyInflux = ITimedEntry & {
    basic: number | null;
    alias: number | null;
    foundry: number | null;
    nft: number | null;
};

export type IAddressesWithBalanceDailyInflux = ITimedEntry & {
    addressesWithBalance: number | null;
};

export type IActiveAddressesDailyInflux = ITimedEntry & {
    activeAddresses: number | null;
};

export type ITokensTransferredDailyInflux = ITimedEntry & {
    tokens: number | null;
};

export type IAliasActivityDailyInflux = ITimedEntry & {
    created: number | null;
    governorChanged: number | null;
    stateChanged: number | null;
    destroyed: number | null;
};

export type IUnlockConditionsPerTypeDailyInflux = ITimedEntry & {
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
};

export type INftActivityDailyInflux = ITimedEntry & {
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
};

export type ITokensHeldWithUnlockConditionDailyInflux = ITimedEntry & {
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
};

export type IUnclaimedTokensDailyInflux = ITimedEntry & {
    unclaimed: number | null;
};

export type IUnclaimedGenesisOutputsDailyInflux = ITimedEntry & {
    unclaimed: number | null;
};

export type ILedgerSizeDailyInflux = ITimedEntry & {
    keyBytes: number | null;
    dataBytes: number | null;
};

export type IStorageDepositDailyInflux = ITimedEntry & {
    storageDeposit: number | null;
};
