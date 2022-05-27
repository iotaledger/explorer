export interface ActivityProps {
    /**
     * transaction Id.
     */
    transactionId: string;
    /**
     * The date of transaction
     */
    date?: string;
    /**
     * The action of transaction
     */
    action: string;
    /**
     * The status of transaction
     */
    status: string;
    /**
     * The price of transaction
     */
    price: string;
    /**
     * Network
     */
    network?: string;
    /**
     * True if the activity is rendered like a table
     */
    tableFormat?: boolean;
}
