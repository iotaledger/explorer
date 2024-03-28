import { Block } from "@iota/sdk-stardust";
import { IResponse } from "../IResponse";

export interface IBlockResponse extends IResponse {
    /**
     * The deserialized block.
     */
    block?: Block;
}
