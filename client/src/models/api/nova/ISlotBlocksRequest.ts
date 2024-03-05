export interface ISlotBlocksRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The slot index to get the details for.
     */
    slotIndex: string;

    /**
     * The cursor state for the request.
     */
    cursor?: string;
}
