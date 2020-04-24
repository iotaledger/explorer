import { IResponse } from "./IResponse";

export interface ICurrenciesResponse extends IResponse {
    /**
     * The time the data was last updated..
     */
    lastUpdated?: number;

    /**
     * The exchange rate for the base currency.
     */
    baseRate?: number;

    /**
     * The market cap.
     */
    marketCap?: number;

    /**
     * The volume in the last 24H.
     */
    volume24h?: number;

    /**
     * The percentage change in the last 24H.
     */
    percentageChange24h?: number;

    /**
     * The currencies and their exchange rates from base rate.
     */
    currencies?: { [id: string]: number };
}
