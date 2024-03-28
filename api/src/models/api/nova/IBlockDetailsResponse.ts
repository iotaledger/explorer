import { BlockMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Block metadata.
     */
    metadata?: BlockMetadataResponse;
}
