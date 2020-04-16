/**
 * Signature of a transaction that the IRI has recently confirmed.
 */
export interface ITxTrytes {
    /**
     * Trytes.
     */
    trytes: string;

    /**
     * Transaction hash.
     */
    hash: string;
}
