import { IBlockMetadata as BlockMetadata } from "@iota/sdk-wasm-nova/web";

export interface IBlockMetadata {
    /**
     * Metadata.
     */
    metadata?: BlockMetadata;

    /**
     * The metadata failed.
     */
    metadataError?: string;
}
