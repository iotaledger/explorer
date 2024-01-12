import { Block } from "@iota/sdk-wasm/web";
import { IResponse } from "../../IResponse";

export interface IBlockResponse extends IResponse {
    /**
     * The deserialized block.
     */
    block: Block;
}

