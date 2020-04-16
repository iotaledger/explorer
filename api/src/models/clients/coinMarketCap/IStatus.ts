/**
 * Representation of CoinMarketCap status response.
 */
export interface IStatus {
    /**
     * Timestamp.
     */
    timestamp: string;
    /**
     * Error code.
     */
    error_code: number;
    /**
     * Error messge.
     */
    error_message: string;
    /**
     * Elapsed.
     */
    elapsed: number;
    /**
     * Credit count.
     */
    credit_count: number;
}
