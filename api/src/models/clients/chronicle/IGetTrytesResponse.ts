export interface IGetTrytesResponse {
    /**
     * The transaction ojects for the requested hashes.
     */
    trytes: {
        /**
         * Address.
         */
        address: string;
        /**
         * Attachment timestamp.
         */
        attachmentTimestamp: number;
        /**
         * Attachment timestamp lower bound.
         */
        attachmentTimestampLowerBound: number;
        /**
         * Attachmetn timestamp upper bound.
         */
        attachmentTimestampUpperBound: number;
        /**
         * Branch transaction.
         */
        branchTransaction: string;
        /**
         * Bundle.
         */
        bundle: string;
        /**
         * Current index.
         */
        currentIndex: number;
        /**
         * Last index
         */
        lastIndex: number;
        /**
         * Nonce.
         */
        nonce: string;
        /**
         * Obsolete tag
         */
        obsoleteTag: string;
        /**
         * Signature Message Fragment
         */
        signatureMessageFragment: string;
        /**
         * Snapshot index.
         */
        snapshotIndex?: number;
        /**
         * Tag.
         */
        tag: string;
        /**
         * Timestamp.
         */
        timestamp: number;
        /**
         * Trunk transaction.
         */
        trunkTransaction: string;
        /**
         * Value.
         */
        value: number;
    }[];
}
