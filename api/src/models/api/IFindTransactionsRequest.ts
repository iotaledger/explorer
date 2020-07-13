import { FindTransactionsMode } from "./findTransactionsMode";

export interface IFindTransactionsRequest {
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
    mode?: FindTransactionsMode;

    /**
     * Find value transactions only.
     */
    valuesOnly?: boolean;

    /**
     * Cursor to use for subsequent requests.
     */
    cursor?: string;
}
