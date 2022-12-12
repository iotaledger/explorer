import { IBlock } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IBlockResponse extends IResponse {
    /**
     * The deserialized block.
     */
    block?: IBlock;
}

