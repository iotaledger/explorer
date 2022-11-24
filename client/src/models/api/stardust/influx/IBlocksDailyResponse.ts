import { IResponse } from "../../IResponse";

export interface IBlocksInflux {
    time: Date;
    transaction: number | null;
    milestone: number | null;
    taggedData: number | null;
    noPayload: number | null;
}

export interface IBlocksDailyResponse extends IResponse {
    blocksDaily: IBlocksInflux[];
}

