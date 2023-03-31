import { IFeedBlockMetadata } from "./IFeedBlockMetadata";

export interface IFeedBlockData {
    /**
     * The block id.
     */
    blockId: string;

    /**
     * The transaction value.
     */
    value?: number;

    /**
     * The parents.
     */
    parents?: string[];

    /**
     * Metadata for the item.
     */
    properties?: { [key: string]: unknown };

    /**
     * The payload type for Stardust.
     */
    payloadType?: "Transaction" | "TaggedData" | "Milestone" | "None";

    /**
     * Metadata for the item.
     */
    metadata?: IFeedBlockMetadata;
}
