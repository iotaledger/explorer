export interface ITransactionEntryProps {
    /**
     * The transaction id.
     */
    transactionId: string;

    /**
     * The date of the transaction.
     */
    date: number;

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
}

