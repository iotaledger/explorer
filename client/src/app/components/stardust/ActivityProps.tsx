export interface ActivityProps {
    /**
     * transaction Id.
     */
    transactionId: string;
    /**
     * date
     */
    date?: string;
    /**
     * action
     */
    action: string;
    /**
     * status
     */
    status: string;
    /**
     * price
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
