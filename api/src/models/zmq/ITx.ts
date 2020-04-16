/**
 * Transactions that the IRI has recently appended to the ledger.
 */
export interface ITx {
    /**
     * Transaction Hash.
     */
    hash: string;

    /**
     * Address hash.
     */
    address: string;

    /**
     * Value.
     */
    value: number;

    /**
     * Obsolete Tag.
     */
    obsoleteTag: string;

    /**
     * Timestamp.
     */
    timestamp: number;

    /**
     * Current Index.
     */
    currentIndex: number;

    /**
     * Last Index.
     */
    lastIndex: number;

    /**
     * Bundle hash.
     */
    bundle: string;

    /**
     * Trunk hash.
     */
    trunk: string;

    /**
     * Branch hash.
     */
    branch: string;

    /**
     * Attachment Timestamp.
     */
    attachmentTimestamp: number;

    /**
     * Tag.
     */
    tag: string;
}
