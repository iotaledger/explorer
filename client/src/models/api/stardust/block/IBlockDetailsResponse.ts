import { IBlockMetadata } from "@iota/iota.js-stardust";
import { IResponse } from "../../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Message metadata.
     */
    metadata?: IBlockMetadata;

    /**
     * Message ids for the children.
     */
    childrenBlockIds?: string[];
}
