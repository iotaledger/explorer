import { IFindTransactionsHint } from "./IFindTransactionsHint";

export interface IFindTransactionsRequestHint extends IFindTransactionsHint {
    /**
     * The address to search for transactions.
     */
    address?: string;

    /**
     * The tag to search for transactions.
     */
    tag?: string;
}
