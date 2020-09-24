import { TransactionsGetMode } from "./transactionsGetMode";

export interface ITransactionsGetRequest {
    /**
     * The network to search on.
     */
    network: string;

    /**
     * The hash to look for.
     */
    hash: string;

    /**
     * The mode to look for transactions if known.
     */
    mode?: TransactionsGetMode;

    /**
     * Find value transactions only.
     */
    valuesOnly?: boolean;

    /**
     * Disable limit
     */
    disableLimit?: boolean;
}
