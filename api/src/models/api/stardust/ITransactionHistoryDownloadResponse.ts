import { ITransactionHistoryItem } from "./ITransactionHistoryResponse";

/*
 * The transaction history.
 */
export interface ITransactionHistoryDownloadResponse {
    /**
     * Address the history is for.
     */
    address?: string;

    /**
     * The history items.
     */
    items?: ITransactionHistoryItem[];
}

