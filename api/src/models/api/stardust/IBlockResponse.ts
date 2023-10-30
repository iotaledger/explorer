import { Block } from "@iota/sdk";
import { IResponse } from "../IResponse";

export interface IBlockResponse extends IResponse {
    /**
     * The deserialized block.
     */
    block?: Block;
}

