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
     * The currencies and their exchange rates from base rate.
     */
    currencies?: { [id: string]: number };
}
