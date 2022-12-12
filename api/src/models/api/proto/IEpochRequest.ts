export interface IEpochRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The epoch id to get the details for.
     */
    epochId?: string;

    index?: number;
}
