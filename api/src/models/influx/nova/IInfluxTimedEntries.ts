import { ITimedEntry } from "../types";

export type IBlocksDailyInflux = ITimedEntry & {
    transaction: number | null;
    taggedData: number | null;
    validation: number | null;
    candidacy: number | null;
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
// add missing fields for each address type
export type IAddressesWithBalanceDailyInflux = ITimedEntry & {
    addressesWithBalance: number | null;
};
// add missing fields for each address type
export type IActiveAddressesDailyInflux = ITimedEntry & {
    activeAddresses: number | null;
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
