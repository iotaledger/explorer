export interface IMarket {
    /**
     * The currency.
     */
    currency: string;

    /**
     * Market data by date.
     */
    data: {
        /**
         * The market date.
         */
        d: string;
        /**
         * The market price.
         */
        p: number;
        /**
         * The market cap.
         */
        m: number;
        /**
         * 24h Market volume.
         */
        v: number;
    }[];

    /**
     * Market data for the last 24 hours.
     */
    day: {
        /**
         * The timestamp.
         */
        t: number;
        /**
         * The market price.
         */
        p: number;
        /**
         * The market cap.
         */
        m: number;
        /**
         * 24h Market volume.
         */
        v: number;
    }[];
}
