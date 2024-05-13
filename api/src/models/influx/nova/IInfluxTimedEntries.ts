import { ITimedEntry } from "../types";

export type IBlocksDailyInflux = ITimedEntry & {
    transaction: number | null;
    taggedData: number | null;
    validation: number | null;
    candidacy: number | null;
};

export type IBlockIssuerDailyInflux = ITimedEntry & {
    active: number | null;
    registered: number | null;
};

export type ITransactionsDailyInflux = ITimedEntry & {
    finalized: number | null;
    failed: number | null;
};

export type IOutputsDailyInflux = ITimedEntry & {
    basic: number | null;
    account: number | null;
    foundry: number | null;
    nft: number | null;
    anchor: number | null;
    delegation: number | null;
};

export type ITokensHeldPerOutputDailyInflux = ITimedEntry & {
    basic: number | null;
    account: number | null;
    foundry: number | null;
    nft: number | null;
    anchor: number | null;
    delegation: number | null;
};

export type IAddressesWithBalanceDailyInflux = ITimedEntry & {
    ed25519: number | null;
    account: number | null;
    implicit: number | null;
    nft: number | null;
    anchor: number | null;
};

export type IActiveAddressesDailyInflux = ITimedEntry & {
    ed25519: number | null;
    account: number | null;
    implicit: number | null;
    nft: number | null;
    anchor: number | null;
};

export type ITokensTransferredDailyInflux = ITimedEntry & {
    tokens: number | null;
};

export type IAnchorActivityDailyInflux = ITimedEntry & {
    created: number | null;
    governorChanged: number | null;
    stateChanged: number | null;
    destroyed: number | null;
};

export type INftActivityDailyInflux = ITimedEntry & {
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
};

export type IAccountActivityDailyInflux = ITimedEntry & {
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
};

export type IFoundryActivityDailyInflux = ITimedEntry & {
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
};

export type IDelegationActivityDailyInflux = ITimedEntry & {
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
};

export type IValidatorsActivityDailyInflux = ITimedEntry & {
    candidates: number | null;
    total: number | null;
};

export type IDelegatorsActivityDailyInflux = ITimedEntry & {
    total: number | null;
};

export type IDelegationsActivityDailyInflux = ITimedEntry & {
    total: number | null;
};

export type IStakingActivityDailyInflux = ITimedEntry & {
    total: number | null;
};

export type IUnlockConditionsPerTypeDailyInflux = ITimedEntry & {
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
};

export type ITokensHeldWithUnlockConditionDailyInflux = ITimedEntry & {
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
};

export type ILedgerSizeDailyInflux = ITimedEntry & {
    keyBytes: number | null;
    dataBytes: number | null;
};

export type IStorageDepositDailyInflux = ITimedEntry & {
    storageDeposit: number | null;
};

export type IManaBurnedDailyInflux = ITimedEntry & {
    manaBurned: number | null;
    bicBurned: number | null;
};
