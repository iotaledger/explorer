import { Block } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface IBlockResponse extends IResponse {
    /**
     * The deserialized block.
     */
    block: Block;
}
