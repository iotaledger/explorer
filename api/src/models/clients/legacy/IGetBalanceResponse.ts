export interface IGetBalanceResponse {
    /**
     * Error.
     */
    error?: string;

    /**
     * The hash of the requested address.
     */
    address: string;

    /**
     * The balance of the requested address.
     */
    balance: number;

    /**
     * The ledger index of the node during the request.
     */
    ledgerIndex: number;
}
