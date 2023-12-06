import {OutputResponse} from "@iota/sdk-wasm/web";
import {ITransactionHistoryItem} from "~models/api/stardust/ITransactionHistoryResponse";

export interface ITransactionEntryProps {
    /**
     * The transaction id.
     */
    transactionId: string;

    /**
     * The formatted date of the transaction.
     */
    dateFormatted: string;

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

    /**
     * The formatted transaction amount.
     */
    balanceChangeFormatted: string;

    /**
     * Check if transaction from stardust by TransactionHelper.
     */
    isTransactionFromStardustGenesis: boolean;

    /**
     * check some of outputs timestamps zero
     */
    isGenesisByDate: boolean;

    /**
     * The transaction link.
     */
    transactionLink: string;
}

export interface TransactionHistoryProps {
    readonly network: string;
    readonly address?: string;
    readonly setLoading: (isLoadin: boolean) => void;
    readonly setDisabled?: (isDisabled: boolean) => void;
}

export interface ICalculatedTransaction {
    isGenesisByDate: boolean;
    isTransactionFromStardustGenesis: boolean;
    isSpent: boolean;
    transactionLink: string;
    transactionId: string;
    timestamp: number;
    dateFormatted: string;
    balanceChange: number;
    balanceChangeFormatted: string;
    outputs: (OutputResponse & ITransactionHistoryItem)[];
}
