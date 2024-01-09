export interface ITransactionMetadataResponse {
    /**
     * Error.
     */
    error?: string;

    /**
     * The hash of the requested transaction.
     */
    txHash: string;

    /**
     * Whether the requested transaction is solid.
     */
    isSolid: boolean;

    /**
     * Whether the requested transaction is included.
     */
    included: boolean;

    /**
     * Whether the requested transaction is confirmed.
     */
    confirmed: boolean;

    /**
     * Whether the requested transaction is conflicting.
     */
    conflicting: boolean;

    /**
     * The milestone index that references this transaction.
     */
    referencedByMilestoneIndex?: number;

    /**
     * The milestone timestamp this transaction was referenced.
     */
    milestoneTimestampReferenced: number;

    /**
     * If this transaction represents a milestone this is the milestone index.
     */
    milestoneIndex?: number;

    /**
     * The ledger index of the node during the request.
     */
    ledgerIndex: number;
}
