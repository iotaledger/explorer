import { HexEncodedString } from "@iota/iota.js-stardust";
import { IFeedBlockMetadata } from "./IFeedBlockMetadata";

export interface IFeedBlockProperties {
    index?: number;
    tag?: HexEncodedString;
    timestamp?: number;
    milestoneId?: HexEncodedString;
    transactionId?: HexEncodedString;
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
     * The feed block properties.
     */
    properties?: IFeedBlockProperties;

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
