import { BlockMetadataResponse } from "@iota/sdk-wasm-nova/web";

export interface IBlockMetadata {
    /**
     * Metadata.
     */
    metadata?: BlockMetadataResponse;

    /**
     * The metadata failed.
     */
    metadataError?: string;
}
