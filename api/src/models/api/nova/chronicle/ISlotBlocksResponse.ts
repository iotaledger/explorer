import { HexEncodedString, PayloadType } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

export interface ISlotBlock {
    /**
     * The block id.
     */
    blockId: HexEncodedString;

    /**
     * The payload type.
     */
    payloadType: PayloadType;
}

export interface ISlotBlocksResponse extends IResponse {
    /**
     * The slot blocks.
     */
    blocks?: ISlotBlock[];

    /**
     * The cursor state for the request.
     */
    cursor?: string;
}
