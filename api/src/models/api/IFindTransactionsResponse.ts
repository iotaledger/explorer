import { IResponse } from "./IResponse";

export interface IFindTransactionsResponse extends IResponse {
    /**
     * The hashes for the matching transaction.
     */
    hashes?: string[];

    /**
     * Are there more than the transactions returned.
     */
    totalCount?: number;
}
