import { Block } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface IBlockResponse extends IResponse {
    /**
     * The deserialized block.
     */
    block?: Block;
}
