
export interface IFindTransactionsResponse {
    /**
     * Error.
     */
    error?: string;

    /**
     * The address of the searched transactions.
     */
    address?: string;

    /**
     * The tag of the searched transactions.
     */
    tag?: string;

    /**
     * The bundle of the searched transactions.
     */
    bundle?: string;

    /**
     * The approvee of the searched transactions.
     */
    approvee?: string;

    /**
     * The hashes of the found transactions.
     */
    txHashes: string[];

    /**
     * The ledger index of the node during the request.
     */
    ledgerIndex: number;
}
