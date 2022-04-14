import { IResponse } from "./IResponse";

export interface ICurrencyNamesResponse extends IResponse {
    /**
     * The currency acronym to name map.
     */
    currencyNames?: { [id: string]: string };
}
