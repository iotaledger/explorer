/**
 * Transaction in the ledger that the IRI has recently confirmed.
 */
export interface ISn {
    /**
     * The milestone index that is set for the given transaction.
     */
    index: number;

    /**
     * Transaction hash.
     */
    transaction: string;

    /**
     * Address.
     */
    address: string;

    /**
     * Trunk transaction hash.
     */
    trunk: string;

    /**
     * Branch transaction hash.
     */
    branch: string;

    /**
     * Bundle hash.
     */
    bundle: string;
}
