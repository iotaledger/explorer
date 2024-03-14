import { IResponse } from "../../IResponse";

interface IBlocksDailyInflux {
    time: Date;
    transaction: number | null;
    taggedData: number | null;
    validation: number | null;
    candidacy: number | null;
}

interface IBlockIssuersDailyInflux {
    time: Date;
    active: number | null;
    registered: number | null;
}

interface ITransactionsDailyInflux {
    time: Date;
    finalized: number | null;
    failed: number | null;
}

interface IOutputsDailyInflux {
    time: Date;
    basic: number | null;
    account: number | null;
    foundry: number | null;
    nft: number | null;
    anchor: number | null;
    delegation: number | null;
}

interface ITokensHeldPerOutputDailyInflux {
    time: Date;
    basic: number | null;
    account: number | null;
    foundry: number | null;
    nft: number | null;
    anchor: number | null;
    delegation: number | null;
}

interface IAddressesWithBalanceDailyInflux {
    time: Date;
    ed25519: number | null;
    account: number | null;
    implicit: number | null;
    nft: number | null;
    anchor: number | null;
}

interface IActiveAddressesDailyInflux {
    time: Date;
    ed25519: number | null;
    account: number | null;
    implicit: number | null;
    nft: number | null;
    anchor: number | null;
}

interface ITokensTransferredDailyInflux {
    time: Date;
    tokens: number | null;
}

interface IAnchorActivityDailyInflux {
    time: Date;
    created: number | null;
    governorChanged: number | null;
    stateChanged: number | null;
    destroyed: number | null;
}

interface INftActivityDailyInflux {
    time: Date;
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
}

interface IAccountActivityDailyInflux {
    time: Date;
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
}

interface IFoundryActivityDailyInflux {
    time: Date;
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
}
interface IDelegationActivityDailyInflux {
    time: Date;
    created: number | null;
    transferred: number | null;
    destroyed: number | null;
}
interface IValidatorsActivityDailyInflux {
    time: Date;
    candidates: number | null;
    total: number | null;
}
interface IDelegatorsActivityDailyInflux {
    time: Date;
    total: number | null;
}
interface IDelegationsActivityDailyInflux {
    time: Date;
    total: number | null;
}

interface IStakingActivityDailyInflux {
    time: Date;
    total: number | null;
}

interface IUnlockConditionsPerTypeDailyInflux {
    time: Date;
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
}

interface ITokensHeldWithUnlockConditionDailyInflux {
    time: Date;
    timelock: number | null;
    storageDepositReturn: number | null;
    expiration: number | null;
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

interface IManaBurnedDailyInflux {
    time: Date;
    manaBurned: number | null;
    bicBurned: number | null;
}

export interface IInfluxDailyResponse extends IResponse {
    blocksDaily?: IBlocksDailyInflux[];
    blockIssuersDaily?: IBlockIssuersDailyInflux[];
    transactionsDaily?: ITransactionsDailyInflux[];
    outputsDaily?: IOutputsDailyInflux[];
    tokensHeldDaily?: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily?: IAddressesWithBalanceDailyInflux[];
    activeAddressesDaily?: IActiveAddressesDailyInflux[];
    tokensTransferredDaily?: ITokensTransferredDailyInflux[];
    anchorActivityDaily?: IAnchorActivityDailyInflux[];
    nftActivityDaily?: INftActivityDailyInflux[];
    accountActivityDaily?: IAccountActivityDailyInflux[];
    foundryActivityDaily?: IFoundryActivityDailyInflux[];
    delegationActivityDaily?: IDelegationActivityDailyInflux[];
    validatorsActivityDaily?: IValidatorsActivityDailyInflux[];
    delegatorsActivityDaily?: IDelegatorsActivityDailyInflux[];
    delegationsActivityDaily?: IDelegationsActivityDailyInflux[];
    stakingActivityDaily?: IStakingActivityDailyInflux[];
    unlockConditionsPerTypeDaily?: IUnlockConditionsPerTypeDailyInflux[];
    tokensHeldWithUnlockConditionDaily?: ITokensHeldWithUnlockConditionDailyInflux[];
    ledgerSizeDaily?: ILedgerSizeDailyInflux[];
    storageDepositDaily?: IStorageDepositDailyInflux[];
    manaBurnedDaily?: IManaBurnedDailyInflux[];
}
