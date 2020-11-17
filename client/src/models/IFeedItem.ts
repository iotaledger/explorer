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
     * The parent 1.
     */
    parent1?: string;

    /**
     * The parent 2.
     */
    parent2?: string;

    /**
     * Metadata for the item.
     */
    metaData?: { [key: string]: unknown };

    /**
     * The payload type if this is Chrysalis.
     */
    payloadType?: "Transaction" | "Index" | "MS" | "No Payload";

    /**
     * Is the item confirmed.
     */
    confirmed: boolean;
}
