import { IBlockMetadata } from "@iota/sdk-wasm-stardust/web";
import { TangleStatus } from "~models/tangleStatus";

export interface BlockMetadata {
    /**
     * Metadata.
     */
    metadata?: IBlockMetadata;

    /**
     * The metadata failed.
     */
    metadataError?: string;

    /**
     * Reason for the conflict.
     */
    conflictReason?: string;

    /**
     * The state of the block on the tangle.
     */
    blockTangleStatus: TangleStatus;
}
