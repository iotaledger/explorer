import { Network } from "../network";
import { FindTransactionsMode } from "./findTransactionsMode";

export interface IFindTransactionsRequest {
    /**
     * The network to search on.
     */
    network: Network;

    /**
     * The hash to look for.
     */
    hash: string;

    /**
     * The mode to look for transactions.
     */
    mode: FindTransactionsMode;
}
