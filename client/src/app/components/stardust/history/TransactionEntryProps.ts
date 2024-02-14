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
     * Is the transaction expired.
     */
    isExpired: boolean;

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
