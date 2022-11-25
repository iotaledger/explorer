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

export interface IInfluxDailyResponse extends IResponse {
    blocksDaily: IBlocksDailyInflux[];
    transactionsDaily: ITransactionsDailyInflux[];
}

