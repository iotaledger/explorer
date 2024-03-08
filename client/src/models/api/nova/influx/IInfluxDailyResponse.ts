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

export interface IInfluxDailyResponse extends IResponse {
    blocksDaily?: IBlocksDailyInflux[];
    transactionsDaily?: ITransactionsDailyInflux[];
}
