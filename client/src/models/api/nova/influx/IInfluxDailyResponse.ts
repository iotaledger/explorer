import { IResponse } from "../../IResponse";

interface IBlocksDailyInflux {
    time: Date;
    transaction: number | null;
    taggedData: number | null;
    validation: number | null;
    candidacy: number | null;
}

export interface IInfluxDailyResponse extends IResponse {
    blocksDaily?: IBlocksDailyInflux[];
}
