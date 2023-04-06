import { HexEncodedString } from "@iota/iota.js-stardust";
import { IFeedBlockMetadata } from "./IFeedBlockMetadata";

export interface IFeedBlockProperties {
    index?: number;
    tag?: HexEncodedString;
    timestamp?: number;
    milestoneId?: string;
}

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
    properties?: IFeedBlockProperties;

    /**
     * The transaction id.
     */
    transactionId?: HexEncodedString;

    /**
     * The blocks with same transaction id (reattached transaction).
     */
    reattachments?: IFeedBlockData[];

    /**
     * The payload type for Stardust.
     */
    payloadType?: "Transaction" | "TaggedData" | "Milestone" | "None";

    /**
     * Metadata for the item.
     */
    metadata?: IFeedBlockMetadata;
}
