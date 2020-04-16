/**
 * Information about the tip transaction requester.
 */
export interface IRstat {
    /**
     * Number of received tip transactions that the IRI is yet to process.
     */
    received: number;

    /**
     * Number of tip transactions that the IRI is yet to broadcast to its neighbors.
     */
    toBroadcast: number;

    /**
     * Number of tip transactions that the IRI is yet to request from its neighbors.
     */
    notRequested: number;

    /**
     * Number of requested tip transaction that the IRI is yet to send as a reply to its neighbors.
     */
    notSent: number;

    /**
     * Number of stored transactions in the ledger.
     */
    stored: number;
}
