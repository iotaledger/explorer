import { IFeedItemMetadata } from "./api/IFeedItemMetadata";

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
     * The payload type if this is Chrysalis.
     */
    payloadType?: "Transaction" | "Index" | "MS" | "None";

    /**
     * Metadata for the item.
     */
    metaData?: IFeedItemMetadata;
}
