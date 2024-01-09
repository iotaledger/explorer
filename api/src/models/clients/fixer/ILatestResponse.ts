export interface ILatestResponse {
    /**
     * Was the request a success.
     */
    success: boolean;

    /**
     * The timestamp of the request.
     */
    timestamp: number;

    /**
     * The base currency.
     */
    base: string;

    /**
     * The date of the rates.
     */
    date: string;

    /**
     * The rates.
     */
    rates: { [id: string]: number };
}
