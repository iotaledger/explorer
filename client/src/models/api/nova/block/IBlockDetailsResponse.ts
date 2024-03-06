import { BlockMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Block metadata.
     */
    metadata?: BlockMetadataResponse;
}
