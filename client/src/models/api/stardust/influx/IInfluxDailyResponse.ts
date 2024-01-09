import { IResponse } from "../../IResponse";

interface IBlocksDailyInflux {
    time: Date;
    transaction: number | null;
    milestone: number | null;
    taggedData: number | null;
    noPayload: number | null;
}

interface ITransactionsDailyInflux {
    time: Date;
    confirmed: number | null;
    conflicting: number | null;
}

interface IOutputsDailyInflux {
    time: Date;
    basic: number | null;
    alias: number | null;
    foundry: number | null;
    nft: number | null;
}

interface ITokensHeldPerOutputDailyInflux {
    time: Date;
    basic: number | null;
    alias: number | null;
    foundry: number | null;
    nft: number | null;
}

interface IAddressesWithBalanceDailyInflux {
    time: Date;
    addressesWithBalance: number | null;
}

interface IActiveAddressesDailyInflux {
    time: Date;
    activeAddresses: number | null;
}

interface ITokensTransferredDailyInflux {
    time: Date;
    tokens: number | null;
}

interface IAliasActivityDailyInflux {
    time: Date;
    created: number | null;
    governorChanged: number | null;
    stateChanged: number | null;
    destroyed: number | null;
}

interface IUnlockConditionsPerTypeDailyInflux {
    time: Date;
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
}

interface INftActivityDailyInflux {
    time: Date;
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
}

interface ITokensHeldWithUnlockConditionDailyInflux {
    time: Date;
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
}

interface IUnclaimedTokensDailyInflux {
    time: Date;
    unclaimed: number | null;
}

interface IUnclaimedGenesisOutputsDailyInflux {
    time: Date;
    unclaimed: number | null;
}

interface ILedgerSizeDailyInflux {
    time: Date;
    keyBytes: number | null;
    dataBytes: number | null;
}

interface IStorageDepositDailyInflux {
    time: Date;
    storageDeposit: number | null;
}

export interface IInfluxDailyResponse extends IResponse {
    blocksDaily?: IBlocksDailyInflux[];
    transactionsDaily?: ITransactionsDailyInflux[];
    outputsDaily?: IOutputsDailyInflux[];
    tokensHeldDaily?: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily?: IAddressesWithBalanceDailyInflux[];
    activeAddressesDaily?: IActiveAddressesDailyInflux[];
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
