import { Block } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "../../IResponse";

export interface IBlockResponse extends IResponse {
    /**
     * The deserialized block.
     */
    block: Block;
}
