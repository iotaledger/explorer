export interface IMessageDetailsRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The message id to get the details for.
     */
    messageId: string;

    /**
     * The fields to get.
     */
    fields: "metadata" | "children" | "all";
}
