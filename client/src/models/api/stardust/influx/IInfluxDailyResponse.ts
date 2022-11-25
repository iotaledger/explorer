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

export interface IInfluxDailyResponse extends IResponse {
    blocksDaily: IBlocksDailyInflux[];
    transactionsDaily: ITransactionsDailyInflux[];
    outputsDaily?: IOutputsDailyInflux[];
    tokensHeldDaily?: ITokensHeldPerOutputDailyInflux[];
}

