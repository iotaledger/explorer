import { IResponse } from "../../IResponse";

interface IBlocksDailyInflux {
    time: Date;
    transaction: number | null;
    taggedData: number | null;
    validation: number | null;
    candidacy: number | null;
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

export interface IInfluxDailyResponse extends IResponse {
    blocksDaily?: IBlocksDailyInflux[];
    transactionsDaily?: ITransactionsDailyInflux[];
    outputsDaily?: IOutputsDailyInflux[];
    tokensHeldDaily?: ITokensHeldPerOutputDailyInflux[];
    addressesWithBalanceDaily?: IAddressesWithBalanceDailyInflux[];
    activeAddressesDaily?: IActiveAddressesDailyInflux[];
    tokensTransferredDaily?: ITokensTransferredDailyInflux[];
}
