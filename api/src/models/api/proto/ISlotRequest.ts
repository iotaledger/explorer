export interface ISlotRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The slot id to get the details for.
     */
    slotId?: string;

    index?: number;
}
