import { IFeedItemMetadata } from "./IFeedItemMetadata";

// Chrysalis | Stardust
type IndexationPayloadType = "Index" | "Data";

export interface IFeedItem {
    /**
     * The hash.
     */
    id: string;

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
     * The payload type for Chrysalis/Stardust.
     */
    payloadType?: "Transaction" | IndexationPayloadType | "MS" | "None" | "Epoch";

    /**
     * Metadata for the item.
     */
    metaData?: IFeedItemMetadata;
}
