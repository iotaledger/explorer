import { IBlockMetadata } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Message metadata.
     */
    metadata?: IBlockMetadata;

    /**
     * Block ids for the children.
     */
    children?: string[];
}
