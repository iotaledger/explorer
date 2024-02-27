export interface ITransactionHistoryEntryProps {
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
     * The formatted transaction amount.
     */
    balanceChangeFormatted: string;

    /**
     * The transaction link.
     */
    transactionLink: string;
}
