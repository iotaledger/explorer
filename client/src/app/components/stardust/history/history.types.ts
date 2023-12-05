import {OutputResponse} from "@iota/sdk-wasm/web";
import {ITransactionHistoryItem} from "~models/api/stardust/ITransactionHistoryResponse";

export interface ITransactionEntryProps {
    /**
     * The output id.
     */
    outputId: string;

    /**
     * The transaction id.
     */
    transactionId: string;

    /**
     * The date of the transaction.
     */
    date: number;

    /**
     * The milestone index of the transaction.
     */
    milestoneIndex: number;

    /**
     * The transaction amount.
     */
    value: number;

    /**
     * Is the transaction spent.
     */
    isSpent: boolean;

    /**
     * Are the amounts formatted.
     */
    isFormattedAmounts: boolean;

    /**
     * The setter for formatted amounts toggle.
     */
    setIsFormattedAmounts: React.Dispatch<React.SetStateAction<boolean>>;

    /**
     * To colour the transaction row ligter/darker, alternating on
     * unrelated transactions.
     */
    darkBackgroundRow?: boolean;
}

export interface TransactionHistoryProps {
    readonly network: string;
    readonly address?: string;
    readonly setLoading: (isLoadin: boolean) => void;
    readonly setDisabled?: (isDisabled: boolean) => void;
}

export interface ICalculatedTransaction {
    transactionId: string;
    timestamp: number;
    balanceChange: number;
    outputs: (OutputResponse & ITransactionHistoryItem)[];
}
