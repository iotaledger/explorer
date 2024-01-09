import { IResponse } from "../IResponse";

/**
 * A transaction history item.
 */
export interface ITransactionHistoryItem {
    /**
     * The milestone index this item is included in.
     */
    milestoneIndex: number;

    /**
     * The milestone timestamp this item is included in.
     */
    milestoneTimestamp: number;

    /**
     * The outputId.
     */
    outputId: string;

    /**
     * Is the output spent.
     */
    isSpent: boolean;
}

/*
 * The transaction history response.
 */
export interface ITransactionHistoryResponse extends IResponse {
    /**
     * Address the history is for.
     */
    address?: string;

    /**
     * The history items.
     */
    items?: ITransactionHistoryItem[];

    /**
     * The cursor for next request.
     */
    cursor?: string;
}
