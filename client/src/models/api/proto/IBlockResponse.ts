import { IBlock } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IBlockResponse extends IResponse {
    block?: IBlock;
}
