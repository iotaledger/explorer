import { HexEncodedString } from "@iota/sdk-stardust";
import { IResponse } from "../../IResponse";

export interface IBlockChildrenResponse extends IResponse {
    /**
     * The block id.
     */
    blockId?: HexEncodedString;

    /**
     * The children block ids.
     */
    children?: HexEncodedString[];

    /**
     * The max number of results.
     */
    maxResults?: number;

    /**
     * The count.
     */
    count?: number;
}
